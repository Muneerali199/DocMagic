import { SiteHeader } from '@/components/site-header';
import PricingPlans from '@/components/pricing/pricing-plans';

export default function PricingPage() {
  return (
    <div className='min-h-screen flex flex-col relative overflow-hidden'>
      <div className='absolute inset-0 mesh-gradient opacity-20'></div>
      <div className='floating-orb w-40 h-40 sm:w-64 sm:h-64 bolt-gradient opacity-15 top-20 -left-20 sm:-left-32'></div>
      <div className='floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-20 -top-10 right-10 sm:right-20'></div>
      <div className='floating-orb w-48 h-48 sm:w-72 sm:h-72 bolt-gradient opacity-10 bottom-10 left-1/3'></div>
      <SiteHeader />
      <main className='flex-1 relative z-10'>
        <PricingPlans />
      </main>
    </div>
  );
}