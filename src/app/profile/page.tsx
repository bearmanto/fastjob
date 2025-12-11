import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BasicInfoForm } from './BasicInfoForm';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { ResumeSection } from './ResumeSection';
import styles from '../dashboard/Dashboard.module.css';

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Profile Role (Security Check)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Safety check: specific route for seekers
    if (profile?.role === 'hirer') {
        redirect('/dashboard');
    }

    // Fetch Experience and Education
    const { data: experiences } = await supabase
        .from('profile_experience')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });

    const { data: education } = await supabase
        .from('profile_education')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });

    // Generate Resume URL if exists
    // Resume is public, so we just use the stored URL
    const resumeDownloadUrl = profile?.resume_url;

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'My Profile' }]} />
            <h1 className={styles.heading}>
                My Profile
            </h1>

            <div style={{ maxWidth: '800px' }}>
                <BasicInfoForm profile={profile || {}} />
                <ResumeSection resumeUrl={profile?.resume_url} resumeDownloadUrl={resumeDownloadUrl} />
                <ExperienceSection experiences={experiences || []} />
                <EducationSection education={education || []} />
            </div>
        </div>
    );
}
