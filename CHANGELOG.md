# Changelog

## [1.0.1] - 2026-09-29
### Mobile Responsiveness & One-Click Auto-Deploy
- **Mobile Navigation Overhaul**: Redesigned header capsule and layout for mobile screens (320px–1024px); eliminated horizontal overflow and truncated CTA buttons.
- **Always-Visible Mobile Hamburger**: Styled and positioned high-contrast hamburger button that guarantees instant access to all menus on any mobile screen.
- **Interactive Mobile Drawer (`MobileNav`)**: Added full-feature slide drawer with quick-navigation tags (Catalog, Divisions, Buyer Portal), expandable accordion sub-menus, smooth backdrop blur, body scroll lock, and WhatsApp direct contact.
- **Executive Portal Auto-Deploy & Sync Engine**: Enhanced `/executive-portal-aelbd/maintenance` with real-time GitHub commit/version comparison from `rmrecap/APPAREL-EMPORIUM`.
- **One-Click Hostinger Update**: Added automated deployment pipeline (`git reset --hard origin/main`, `npm install`, `prisma db push`, `npm run build`, PM2 reload) accessible via "Check for Updates" and "Update Now" buttons without manual SSH or hPanel logins.

## [1.0.0] - 2024-11-20
### Initial Release
- Multi-page garments buying house website
- Admin dashboard with 5-tier RBAC (Developer, Super Admin, Admin, Editor, Viewer)
- Dynamic CMS with homepage builder
- Product management with bulk upload via Excel
- RFQ system with Kanban board
- Blog system
- Media library
- Theme manager
- Menu builder
- SEO manager
- Tracking pixel manager
- Email notification system
- Cookie consent
- Activity logging
- Backup & restore capabilities

## How to Update
1. Push changes to GitHub main branch
2. GitHub Actions auto-deploys via SSH, OR
3. Use Admin Dashboard → Maintenance → Check for Updates → Update Now
4. Manual Method: SSH into server, `git pull`, `npm run build`, `pm2 restart garments-website`
