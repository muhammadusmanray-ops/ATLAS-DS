// Notification Service
// Handles browser notifications and email alerts for Kaggle competitions

import { kaggleService, CompetitionMetadata } from './kaggle';

interface NotificationPreferences {
    emailAlerts: boolean;
    browserNotifications: boolean;
    deadlineReminders: boolean;
    newCompetitionAlerts: boolean;
    userEmail?: string;
}

class NotificationService {
    private preferences: NotificationPreferences = {
        emailAlerts: false,
        browserNotifications: false,
        deadlineReminders: true,
        newCompetitionAlerts: true,
    };

    // Initialize notification service
    async initialize() {
        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }

        // Load user preferences from localStorage
        const saved = localStorage.getItem('notificationPreferences');
        if (saved) {
            this.preferences = JSON.parse(saved);
        }
    }

    // Update preferences
    updatePreferences(prefs: Partial<NotificationPreferences>) {
        this.preferences = { ...this.preferences, ...prefs };
        localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    }

    // Send browser notification
    async sendBrowserNotification(title: string, body: string, url?: string) {
        if (!this.preferences.browserNotifications) return;

        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'kaggle-competition',
                requireInteraction: false,
            });

            if (url) {
                notification.onclick = () => {
                    window.open(url, '_blank');
                    notification.close();
                };
            }

            // Auto-close after 10 seconds
            setTimeout(() => notification.close(), 10000);
        }
    }

    // Send email alert (via EmailJS)
    async sendEmailAlert(subject: string, message: string) {
        if (!this.preferences.emailAlerts || !this.preferences.userEmail) return;

        try {
            // EmailJS configuration
            const serviceId = 'service_kaggle'; // You'll need to set this up
            const templateId = 'template_competition_alert';
            const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY'; // Free from emailjs.com

            const templateParams = {
                to_email: this.preferences.userEmail,
                subject: subject,
                message: message,
                from_name: 'ATLAS-X Kaggle Alerts',
            };

            // Note: EmailJS library needs to be imported
            // For now, this is a placeholder
            console.log('Email would be sent:', { subject, message });

            // Actual implementation:
            // await emailjs.send(serviceId, templateId, templateParams, publicKey);
        } catch (error) {
            console.error('Failed to send email:', error);
        }
    }

    // Check for deadline alerts
    async checkDeadlineAlerts() {
        if (!this.preferences.deadlineReminders) return;

        const endingSoon = await kaggleService.getEndingSoon(7);

        for (const comp of endingSoon) {
            if (comp.daysLeft <= 3) {
                await this.sendBrowserNotification(
                    `⏰ Deadline Alert!`,
                    `${comp.title} ends in ${comp.daysLeft} days!`,
                    comp.kaggleUrl
                );

                await this.sendEmailAlert(
                    `Kaggle Competition Ending Soon`,
                    `The competition "${comp.title}" is ending in ${comp.daysLeft} days. Don't miss out on the ${comp.prize} prize!`
                );
            }
        }
    }

    // Check for new competitions
    async checkNewCompetitions() {
        if (!this.preferences.newCompetitionAlerts) return;

        const newComps = await kaggleService.getNewCompetitions(7);

        if (newComps.length > 0) {
            const topComp = newComps[0];
            await this.sendBrowserNotification(
                `🏆 New Competition!`,
                `${topComp.title} - Prize: ${topComp.prize}`,
                topComp.kaggleUrl
            );
        }
    }

    // Daily digest
    async sendDailyDigest() {
        if (!this.preferences.emailAlerts) return;

        const [endingSoon, newComps] = await Promise.all([
            kaggleService.getEndingSoon(7),
            kaggleService.getNewCompetitions(7),
        ]);

        const message = `
📊 Your Daily Kaggle Digest

🔥 Ending Soon:
${endingSoon.map(c => `• ${c.title} (${c.daysLeft} days left) - ${c.prize}`).join('\n')}

🆕 New Competitions:
${newComps.map(c => `• ${c.title} - ${c.prize}`).join('\n')}

Happy competing!
- ATLAS-X Team
    `.trim();

        await this.sendEmailAlert('Your Daily Kaggle Digest', message);
    }

    // Start periodic checks (every 6 hours)
    startPeriodicChecks() {
        // Check immediately
        this.checkDeadlineAlerts();
        this.checkNewCompetitions();

        // Then check every 6 hours
        setInterval(() => {
            this.checkDeadlineAlerts();
            this.checkNewCompetitions();
        }, 6 * 60 * 60 * 1000);

        // Daily digest at 9 AM
        const now = new Date();
        const next9AM = new Date(now);
        next9AM.setHours(9, 0, 0, 0);
        if (next9AM < now) {
            next9AM.setDate(next9AM.getDate() + 1);
        }
        const timeUntil9AM = next9AM.getTime() - now.getTime();

        setTimeout(() => {
            this.sendDailyDigest();
            // Then repeat daily
            setInterval(() => this.sendDailyDigest(), 24 * 60 * 60 * 1000);
        }, timeUntil9AM);
    }
}

export const notificationService = new NotificationService();
export type { NotificationPreferences };
