import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { profileUrl, profileData } = await req.json();

    // If user provides raw profile data (JSON export or manual entry)
    if (profileData) {
      return NextResponse.json({ 
        success: true, 
        data: parseLinkedInData(profileData) 
      });
    }

    // If user provides LinkedIn profile URL
    if (profileUrl) {
      const scrapedData = await scrapeLinkedInProfile(profileUrl);
      return NextResponse.json({ 
        success: true, 
        data: parseLinkedInData(scrapedData) 
      });
    }

    return NextResponse.json({ 
      error: 'Please provide either a LinkedIn profile URL or profile data' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error parsing LinkedIn profile:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to parse LinkedIn profile',
      details: 'Please try using the manual import or JSON export option'
    }, { status: 500 });
  }
}

async function scrapeLinkedInProfile(url: string) {
  try {
    // Use public profile URL (linkedin.com/in/username)
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Extract publicly available data from LinkedIn public profile
    const profileData = {
      name: $('h1.top-card-layout__title').text().trim() || 
            $('h1.text-heading-xlarge').text().trim(),
      headline: $('h2.top-card-layout__headline').text().trim() ||
                $('div.text-body-medium').first().text().trim(),
      location: $('span.top-card-layout__location').text().trim() ||
                $('span.text-body-small').first().text().trim(),
      about: $('section.summary').text().trim() ||
             $('div.core-section-container__content').first().text().trim(),
      experience: [],
      education: [],
      skills: [],
      certifications: []
    };

    // Extract experience
    $('li.profile-section-card').each((i, elem) => {
      const title = $(elem).find('h3').text().trim();
      const company = $(elem).find('h4').text().trim();
      const dates = $(elem).find('span.date-range').text().trim();
      const description = $(elem).find('p.show-more-less-text').text().trim();

      if (title && company) {
        profileData.experience.push({
          title,
          company,
          dates,
          description
        });
      }
    });

    return profileData;
  } catch (error: any) {
    console.error('Error scraping profile:', error.message);
    throw new Error('Unable to access LinkedIn profile. Please use manual import or JSON export option.');
  }
}

function parseLinkedInData(data: any) {
  // Parse and structure LinkedIn data for resume generation
  return {
    personalInfo: {
      name: data.name || data.firstName + ' ' + data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      location: data.location || data.geoLocation || '',
      headline: data.headline || data.tagline || '',
      summary: data.about || data.summary || ''
    },
    experience: (data.experience || data.positions || []).map((exp: any) => ({
      title: exp.title || exp.jobTitle || '',
      company: exp.company || exp.companyName || '',
      location: exp.location || '',
      startDate: exp.startDate || exp.timePeriod?.startDate || '',
      endDate: exp.endDate || exp.timePeriod?.endDate || 'Present',
      description: exp.description || exp.summary || '',
      highlights: exp.highlights || []
    })),
    education: (data.education || data.schools || []).map((edu: any) => ({
      school: edu.school || edu.schoolName || '',
      degree: edu.degree || edu.degreeName || '',
      field: edu.field || edu.fieldOfStudy || '',
      startDate: edu.startDate || edu.timePeriod?.startDate || '',
      endDate: edu.endDate || edu.timePeriod?.endDate || '',
      grade: edu.grade || edu.gpa || '',
      description: edu.description || ''
    })),
    skills: (data.skills || []).map((skill: any) => 
      typeof skill === 'string' ? skill : skill.name || skill.skillName || ''
    ),
    certifications: (data.certifications || data.certificates || []).map((cert: any) => ({
      name: cert.name || cert.certificationName || '',
      issuer: cert.issuer || cert.authority || '',
      date: cert.date || cert.timePeriod?.startDate || '',
      url: cert.url || ''
    })),
    projects: (data.projects || []).map((project: any) => ({
      name: project.name || project.title || '',
      description: project.description || '',
      url: project.url || '',
      startDate: project.startDate || '',
      endDate: project.endDate || ''
    })),
    languages: (data.languages || []).map((lang: any) => ({
      language: typeof lang === 'string' ? lang : lang.name || '',
      proficiency: lang.proficiency || ''
    })),
    volunteering: (data.volunteering || data.volunteer || []).map((vol: any) => ({
      role: vol.role || vol.title || '',
      organization: vol.organization || '',
      description: vol.description || '',
      startDate: vol.startDate || '',
      endDate: vol.endDate || ''
    }))
  };
}
