'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import {
  User, Mail, Calendar, MapPin, Phone, Globe, Edit3, Save, X, Shield, FileText, Activity, Camera, Upload, NotebookPen, IdCard, Contact 
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface UserStats {
  templates_created: number;
  documents_generated: number;
  last_activity: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    phone: '',
    website: ''
  });

  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        router.push('/auth/signin');
        return;
      }

      // Set user profile data
      const userProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || '',
        avatar_url: authUser.user_metadata?.avatar_url || '',
        bio: authUser.user_metadata?.bio || '',
        location: authUser.user_metadata?.location || '',
        phone: authUser.user_metadata?.phone || '',
        website: authUser.user_metadata?.website || '',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at || undefined
      };

      setUser(userProfile);
      setFormData({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        phone: userProfile.phone || '',
        website: userProfile.website || ''
      });

      // Load real user statistics from database with error handling
      let templatesCount = 0;
      let documentsCount = 0;
      let lastActivity = authUser.created_at;

      try {
        // Try to get templates count
        const templatesResult = await supabase
          .from('templates')
          .select('id')
          .eq('user_id', authUser.id);

        templatesCount = templatesResult.data?.length || 0;
      } catch (error) {
        console.warn('Templates table not found or accessible:', error);
      }

      try {
        // Try to get documents count and last activity
        const documentsResult = await supabase
          .from('documents')
          .select('id, created_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(1);

        documentsCount = documentsResult.data?.length || 0;
        lastActivity = documentsResult.data?.[0]?.created_at || authUser.created_at;
      } catch (error) {
        console.warn('Documents table not found or accessible:', error);
      }

      setStats({
        templates_created: templatesCount,
        documents_generated: documentsCount,
        last_activity: lastActivity
      });

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, GIF, or WebP image',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploadingAvatar(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Remove avatars/ prefix since we're already in the avatars bucket

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // Handle specific bucket not found error
        if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket not configured. Please contact support or check the setup guide.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl
        }
      });

      if (updateError) throw updateError;

      // Update local state
      setUser(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully'
      });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);

      let errorMessage = 'Failed to upload profile picture';

      if (error.message?.includes('Storage bucket not configured')) {
        errorMessage = 'Profile picture upload is not configured yet. Please check the setup guide.';
      } else if (error.message?.includes('Bucket not found')) {
        errorMessage = 'Storage bucket not found. Please create the "avatars" bucket in Supabase Storage.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          bio: formData.bio,
          location: formData.location,
          phone: formData.phone,
          website: formData.website
        }
      });

      if (error) throw error;

      // Update local state
      setUser(prev => prev ? {
        ...prev,
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        website: formData.website
      } : null);

      setEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;

    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      website: user.website || ''
    });
    setEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="overflow-x-hidden bg-background">
        <SiteHeader />
        <div className="container mx-auto py-8 px-4 overflow-x-hidden">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted/50 dark:bg-muted/30 rounded w-1/4 mb-4"></div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="h-64 bg-muted/50 dark:bg-muted/30 rounded-lg"></div>
                </div>
                <div className="h-64 bg-muted/50 dark:bg-muted/30 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="overflow-x-hidden bg-background">
        <SiteHeader />
        <div className="container mx-auto py-8 px-4 overflow-x-hidden">
          <div className="text-center">
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto py-8 overflow-x-hidden">
        <div className="max-w-screen-lg mx-auto space-y-6 overflow-x-hidden">
          {/* Header */}
          <div className="flex px-4 items-center justify-between overflow-x-hidden">
            <div className="flex-1 min-w-0 mr-4">
              <h1 className="md:text-3xl text-xl font-bold tracking-tight truncate text-foreground">Profile</h1>
              <p className="text-muted-foreground md:w-auto w-full truncate">
                Manage your account settings and preferences
              </p>
            </div>
            {!editing ? (
              <Button onClick={() => setEditing(true)} className="flex-shrink-0">
                <Edit3 className="mr-2 h-4 w-2 md:w-4" />
                Edit <span className="hidden md:inline">Profile</span>
              </Button>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <Button onClick={handleSave} disabled={saving} size="sm">
                  <Save className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                </Button>
                <Button variant="outline" onClick={handleCancel} size="sm">
                  <X className="mr-1 h-4 w-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-3 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/30 min-h-screen overflow-x-hidden rounded-xl">
            {/* Main Profile Card */}
            <div className="md:col-span-2 overflow-x-hidden shadow-md hover:shadow-lg dark:shadow-none dark:hover:shadow-none rounded-lg dark:border dark:border-violet-700 ">
              <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm hover:shadow-3xl dark:hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 dark:from-blue-700 dark:via-indigo-600 dark:to-violet-600 text-white rounded-t-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-20 w-20 ring-4 ring-white/30 dark:ring-white/20 shadow-lg">
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600 text-white">
                          {user.name ? getInitials(user.name) : <User className="h-8 w-8" />}
                        </AvatarFallback>
                      </Avatar>
                      {editing && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 shadow-lg border-2 border-white dark:border-gray-600"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                        >
                          {uploadingAvatar ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 dark:border-blue-400 border-t-transparent" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left min-w-0">
                      <CardTitle className="text-xl md:text-2xl text-white drop-shadow-md truncate">
                        {user.name || 'Anonymous User'}
                      </CardTitle>
                      <CardDescription className="flex items-center justify-center md:justify-start mt-1 text-blue-100 dark:text-blue-200">
                        <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-4 md:p-8 overflow-x-hidden bg-card">
                  {/* Basic Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 md:p-6 rounded-xl border border-blue-100 dark:border-blue-800/50 shadow-sm overflow-x-hidden">
                    <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
                      <div className="p-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-full mr-3 flex items-center justify-center flex-shrink-0">
                        <IdCard className="text-white h-4 w-4" />
                      </div>
                      <span className="truncate">Basic Information</span>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border overflow-x-hidden">
                        <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
                        {editing ? (
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter your full name"
                            className="mt-2 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 w-full"
                          />
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground font-medium truncate">
                            {user.name || 'Not provided'}
                          </p>
                        )}
                      </div>
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border overflow-x-hidden">
                        <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                        <p className="mt-2 text-sm text-muted-foreground font-medium truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                  {/* Contact Information */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 md:p-6 rounded-xl border border-green-100 dark:border-green-800/50 shadow-sm overflow-x-hidden">
                    <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center">
                      <div className="p-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 rounded-full mr-3 flex items-center justify-center flex-shrink-0">
                        <Contact className="text-white h-4 w-4" />
                      </div>
                      <span className="truncate">Contact Information</span>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border overflow-x-hidden">
                        <Label htmlFor="phone" className="text-foreground font-medium">Phone</Label>
                        {editing ? (
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter your phone number"
                            className="mt-2 border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/20 dark:focus:ring-green-400/20 w-full"
                          />
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground flex items-center font-medium">
                            {user.phone ? (
                              <>
                                <Phone className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <span className="truncate">{user.phone}</span>
                              </>
                            ) : (
                              'Not provided'
                            )}
                          </p>
                        )}
                      </div>
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border overflow-x-hidden">
                        <Label htmlFor="location" className="text-foreground font-medium">Location</Label>
                        {editing ? (
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Enter your location"
                            className="mt-2 border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/20 dark:focus:ring-green-400/20 w-full"
                          />
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground flex items-center font-medium">
                            {user.location ? (
                              <>
                                <MapPin className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <span className="truncate">{user.location}</span>
                              </>
                            ) : (
                              'Not provided'
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="bg-card p-4 rounded-lg shadow-sm border border-border overflow-x-hidden">
                        <Label htmlFor="website" className="text-foreground font-medium">Website</Label>
                        {editing ? (
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="Enter your website URL"
                            className="mt-2 border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500/20 dark:focus:ring-green-400/20 w-full"
                          />
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground flex items-center font-medium">
                            {user.website ? (
                              <>
                                <Globe className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <a
                                  href={user.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors truncate"
                                >
                                  {user.website}
                                </a>
                              </>
                            ) : (
                              'Not provided'
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                  {/* Bio */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 md:p-6 rounded-xl border border-purple-100 dark:border-purple-800/50 shadow-sm overflow-x-hidden">
                    <Label htmlFor="bio" className="text-lg font-semibold text-foreground flex items-center">
                      <div className="p-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-full mr-3 flex items-center justify-center flex-shrink-0">
                        <NotebookPen className="text-white h-4 w-4" />
                      </div>
                      <span className="truncate">Bio</span>
                    </Label>
                    {editing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="mt-4 border-purple-200 dark:border-purple-800 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-500/20 dark:focus:ring-purple-400/20 bg-card shadow-sm w-full resize-none"
                      />
                    ) : (
                      <div className="mt-4 bg-card p-4 rounded-lg shadow-sm border border-border overflow-x-hidden">
                        <p className="text-sm text-muted-foreground leading-relaxed break-words">
                          {user.bio || 'No bio provided'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-8 overflow-x-hidden">
              {/* Account Stats */}
              <Card className="pb-2 shadow-md border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg dark:hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg dark:border dark:border-emerald-300">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white drop-shadow-md">
                    <Activity className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6 overflow-x-hidden">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                    <span className="text-sm text-foreground font-medium truncate flex-1 mr-2">Templates Created</span>
                    <Badge variant="secondary" className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white shadow-sm flex-shrink-0">
                      {stats?.templates_created || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                    <span className="text-sm text-foreground font-medium truncate flex-1 mr-2">Documents Generated</span>
                    <Badge variant="secondary" className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white shadow-sm flex-shrink-0">
                      {stats?.documents_generated || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="mt-1 pb-1 shadow-md border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg dark:hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg dark:border dark:border-amber-200">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white drop-shadow-md">
                    <Shield className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Account Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6 overflow-x-hidden">
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-100 dark:border-amber-800/50 shadow-sm overflow-x-hidden">
                    <Label className="text-sm font-semibold text-foreground">Member Since</Label>
                    <p className="text-sm text-muted-foreground flex items-center mt-2 font-medium">
                      <Calendar className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <span className="truncate">{formatDate(user.created_at)}</span>
                    </p>
                  </div>
                  {user.last_sign_in_at && (
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-100 dark:border-amber-800/50 shadow-sm overflow-x-hidden">
                      <Label className="text-sm font-semibold text-foreground">Last Sign In</Label>
                      <p className="text-sm text-muted-foreground flex items-center mt-2 font-medium">
                        <Calendar className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <span className="truncate">{formatDate(user.last_sign_in_at)}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-1 pb-2 shadow-md border-0 bg-card/80 backdrop-blur-sm hover:shadow-lg dark:hover:shadow-lg transition-all duration-300 overflow-hidden dark:border-teal-200 dark:border">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-white drop-shadow-md">
                    <FileText className="mr-2 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 md:p-6 overflow-x-hidden">
                  <Button
                    variant="outline"
                    className="w-full p-2 justify-start bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 font-medium"
                    onClick={() => router.push('/templates')}
                  >
                    <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Browse Templates</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full p-2 justify-start bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 font-medium"
                    onClick={() => router.push('/resume')}
                  >
                    <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Create Resume</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full p-2 justify-start bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 font-medium"
                    onClick={() => router.push('/settings')}
                  >
                    <Shield className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Account Settings</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
