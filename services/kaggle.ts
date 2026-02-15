// Kaggle API Service
// Integrates with Kaggle's official API for live competition data

const KAGGLE_API_TOKEN = '';
const KAGGLE_USERNAME = '';

interface KaggleCompetition {
    id: number;
    title: string;
    url: string;
    deadline: string;
    category: string;
    reward: string;
    teamCount: number;
    userHasEntered: boolean;
    description: string;
    evaluationMetric: string;
    maxTeamSize: number;
    enabledDate: string;
}

interface CompetitionMetadata {
    id: string;
    title: string;
    diff: string;
    desc: string;
    deadline: string;
    prize: string;
    participants: string;
    kaggleUrl: string;
    isActive: boolean;
    daysLeft: number;
}

class KaggleService {
    private baseUrl = 'https://www.kaggle.com/api/v1';
    private token = KAGGLE_API_TOKEN;
    private username = KAGGLE_USERNAME;

    // Fetch all competitions
    async getCompetitions(): Promise<CompetitionMetadata[]> {
        try {
            // Determine API Endpoint based on environment
            // Localhost: Use standalone Express server (port 3001)
            // Production (Vercel): Use serverless function relative path (/api)
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const PROXY_URL = isLocal ? 'http://localhost:3001' : ''; // Empty string means relative path for Vercel

            const response = await fetch(`${PROXY_URL}/api/competitions`);

            if (!response.ok) {
                console.warn('Proxy server issue, using fallback data');
                return this.getFallbackCompetitions();
            }

            const data = await response.json();
            return this.transformCompetitions(data);
        } catch (error) {
            console.error('Kaggle API Error:', error);
            // Fallback to curated list if API fails
            return this.getFallbackCompetitions();
        }
    }

    // Transform Kaggle API response to our format
    private transformCompetitions(data: any): CompetitionMetadata[] {
        return data.map((comp: KaggleCompetition) => {
            const deadline = new Date(comp.deadline);
            const now = new Date();
            const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return {
                id: comp.url,
                title: comp.title,
                diff: this.categorizeDifficulty(comp.category),
                desc: comp.description || 'Machine learning competition',
                deadline: daysLeft > 0 ? `${daysLeft} days` : 'Ended',
                prize: comp.reward || 'Knowledge',
                participants: `${comp.teamCount.toLocaleString()}+`,
                kaggleUrl: `https://www.kaggle.com/c/${comp.url}`,
                isActive: daysLeft > 0,
                daysLeft: daysLeft,
            };
        });
    }

    // Categorize difficulty based on competition type
    private categorizeDifficulty(category: string): string {
        if (category === 'Getting Started' || category === 'Playground') {
            return 'Beginner';
        } else if (category === 'Research' || category === 'Featured') {
            return 'Advanced';
        }
        return 'Intermediate';
    }

    // Fallback competitions (if API fails)
    private getFallbackCompetitions(): CompetitionMetadata[] {
        return [
            {
                id: 'titanic',
                title: 'Titanic Survival',
                diff: 'Beginner',
                desc: 'Predict who survived the disaster.',
                deadline: 'Evergreen',
                prize: 'Knowledge',
                participants: '15,000+',
                kaggleUrl: 'https://www.kaggle.com/c/titanic',
                isActive: true,
                daysLeft: 999,
            },
            {
                id: 'house',
                title: 'House Prices',
                diff: 'Intermediate',
                desc: 'Predict sales prices using regression.',
                deadline: 'Evergreen',
                prize: 'Knowledge',
                participants: '20,000+',
                kaggleUrl: 'https://www.kaggle.com/c/house-prices-advanced-regression-techniques',
                isActive: true,
                daysLeft: 999,
            },
            {
                id: 'digit',
                title: 'Digit Recognizer',
                diff: 'Beginner',
                desc: 'Computer Vision "Hello World" (MNIST).',
                deadline: 'Evergreen',
                prize: 'Knowledge',
                participants: '30,000+',
                kaggleUrl: 'https://www.kaggle.com/c/digit-recognizer',
                isActive: true,
                daysLeft: 999,
            },
        ];
    }

    // Get competitions ending soon (for alerts)
    async getEndingSoon(days: number = 7): Promise<CompetitionMetadata[]> {
        const competitions = await this.getCompetitions();
        return competitions.filter(comp => comp.daysLeft <= days && comp.daysLeft > 0);
    }

    // Get new competitions (added in last N days)
    async getNewCompetitions(days: number = 7): Promise<CompetitionMetadata[]> {
        const competitions = await this.getCompetitions();
        // This would require checking enabledDate from API
        // For now, return high-prize competitions as "new"
        return competitions.filter(comp =>
            comp.prize !== 'Knowledge' && comp.isActive
        ).slice(0, 5);
    }
}

export const kaggleService = new KaggleService();
export type { CompetitionMetadata };
