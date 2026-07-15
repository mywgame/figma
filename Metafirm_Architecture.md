 # metafir_Architecture

│   .env
│   .env.example
│   .gitignore
│   CHANGELOG.md
│   index.html
│   metadata.json
│   Metafirm_Architecture.md
│   MetaFirm_Business_Logic_Specification.md
│   MetaFirm_Development_Roadmap.md
│   MetaFirm_Master_Blueprint.md
│   package-lock.json
│   package.json
│   README.md
│   server.ts
│   tsconfig.json
│   vite.config.ts
│
├───assets
│   ├───.aistudio
│   │       .gitignore
│   │
│   ├───icons
│   │       favicon.png
│   │       favicon.svg
│   │       usdt-svg.svg
│   │
│   ├───images
│   │   ├───backgrounds
│   │   │   ├───admin
│   │   │   │       .gitkeep
│   │   │   │
│   │   │   ├───auth
│   │   │   │       .gitkeep
│   │   │   │
│   │   │   ├───dashboard
│   │   │   │       .gitkeep
│   │   │   │
│   │   │   └───landing
│   │   │           .gitkeep
│   │   │
│   │   ├───branding
│   │   │       logo-mark.png
│   │   │       logo.png
│   │   │
│   │   ├───illustrations
│   │   │       gpu-farm-illustration.svg
│   │   │       solar-farm-illustration.svg
│   │   │
│   │   └───placeholders
│   │           .gitkeep
│   │
│   └───video
│       ├───admin
│       │       .gitkeep
│       │
│       ├───dashboard
│       │       .gitkeep
│       │
│       └───landing
│               .gitkeep
│               hero-background.mp4
│
├───client
│   │   App.tsx
│   │   index.css
│   │   main.tsx
│   │
│   ├───components
│   │   │   About.tsx
│   │   │   AuthModal.tsx
│   │   │   Contact.tsx
│   │   │   Faq.tsx
│   │   │   Footer.tsx
│   │   │   Hero.tsx
│   │   │   HowItWorks.tsx
│   │   │   LoadingScreen.tsx
│   │   │   Navbar.tsx
│   │   │   RibbonBackground.tsx
│   │   │   Security.tsx
│   │   │   Skeleton.tsx
│   │   │   Stats.tsx
│   │   │   WhyChooseUs.tsx
│   │   │
│   │   ├───Admin
│   │   │       AdminSidebar.tsx
│   │   │       AdminTopbar.tsx
│   │   │       AnnouncementsView.tsx
│   │   │       AuditLogsView.tsx
│   │   │       DashboardHome.tsx
│   │   │       DepositsView.tsx
│   │   │       IncomeView.tsx
│   │   │       index.tsx
│   │   │       RewardsView.tsx
│   │   │       SalaryView.tsx
│   │   │       SecurityView.tsx
│   │   │       SettingsView.tsx
│   │   │       SupportView.tsx
│   │   │       UsersView.tsx
│   │   │       VipView.tsx
│   │   │       WithdrawalsView.tsx
│   │   │
│   │   ├───Dashboard
│   │   │       Announcements.tsx
│   │   │       DailyClaimCard.tsx
│   │   │       DashboardHome.tsx
│   │   │       index.tsx
│   │   │       MetaFirmAssetIcon.tsx
│   │   │       MyTeamView.tsx
│   │   │       PortfolioOverview.tsx
│   │   │       ProfileView.tsx
│   │   │       RecentActivity.tsx
│   │   │       SecurityView.tsx
│   │   │       SettingsView.tsx
│   │   │       Sidebar.tsx
│   │   │       SupportView.tsx
│   │   │       TeamOverview.tsx
│   │   │       TopNav.tsx
│   │   │       TransactionsView.tsx
│   │   │
│   │   └───ui
│   │       │   index.ts
│   │       │   theme.ts
│   │       │
│   │       ├───Buttons
│   │       │       index.tsx
│   │       │
│   │       ├───Cards
│   │       │       index.tsx
│   │       │
│   │       ├───Feedback
│   │       │       index.tsx
│   │       │
│   │       ├───Inputs
│   │       │       index.tsx
│   │       │
│   │       ├───Layout
│   │       │       index.tsx
│   │       │
│   │       ├───Loaders
│   │       │       index.tsx
│   │       │
│   │       ├───Navigation
│   │       │       index.tsx
│   │       │
│   │       └───Overlays
│   │               index.tsx
│   │
│   ├───contexts
│   │       AuthContext.tsx
│   │
│   ├───hooks
│   │       useAuth.ts
│   │
│   ├───layouts
│   │       BaseLayout.tsx
│   │
│   ├───services
│   │       api.ts
│   │
│   ├───types
│   │       index.ts
│   │       vite-env.d.ts
│   │
│   └───utils
│           index.ts
│           landingData.ts
│
├───dist
│   │   index.html
│   │   server.cjs
│   │   server.cjs.map
│   │
│   └───assets
│           favicon-DzAemdKg.png
│           index-B9sThOT7.js
│           index-CjrTn7mj.css
│           logo-CPbukfqA.png
│           logo-mark-CJjUW_hu.png
│
├───drizzle
│   │   0000_eager_legion.sql
│   │   0001_mysterious_lockjaw.sql
│   │   0002_large_blue_shield.sql
│   │   0003_furry_banshee.sql
│   │   0004_colossal_mathemanic.sql
│   │   0004_productive_professor_monster.sql
│   │
│   └───meta
│           0000_snapshot.json
│           0001_snapshot.json
│           0002_snapshot.json
│           0003_snapshot.json
│           0004_snapshot.json
│           _journal.json
│
├───scripts
│       create-superadmin.ts
│
├───server
│   ├───config
│   │       index.ts
│   │
│   ├───controllers
│   │       authController.ts
│   │       userController.ts
│   │
│   ├───middlewares
│   │       auth.ts
│   │       errorHandler.ts
│   │       security.ts
│   │       validate.ts
│   │
│   ├───providers
│   │       emailProvider.ts
│   │       resendProvider.ts
│   │
│   ├───repositories
│   │       achievementRepository.ts
│   │       activityRepository.ts
│   │       auditRepository.ts
│   │       authRepository.ts
│   │       claimRepository.ts
│   │       depositAddressRepository.ts
│   │       depositRepository.ts
│   │       incomeRepository.ts
│   │       notificationRepository.ts
│   │       referralRepository.ts
│   │       salaryRepository.ts
│   │       sessionRepository.ts
│   │       settingsRepository.ts
│   │       supportRepository.ts
│   │       teamCommissionHistoryRepository.ts
│   │       transactionRepository.ts
│   │       userRepository.ts
│   │       vipRepository.ts
│   │       walletRepository.ts
│   │       withdrawalRepository.ts
│   │
│   ├───routes
│   │   │   index.ts
│   │   │
│   │   └───v1
│   │           authRoutes.ts
│   │           index.ts
│   │           userRoutes.ts
│   │
│   ├───services
│   │       adminService.ts
│   │       authService.ts
│   │       claimService.ts
│   │       dashboardService.ts
│   │       depositService.ts
│   │       emailService.ts
│   │       incomeService.ts
│   │       notificationService.ts
│   │       referralService.ts
│   │       salaryService.ts
│   │       settingsService.ts
│   │       supportService.ts
│   │       userService.ts
│   │       vipService.ts
│   │       walletService.ts
│   │       withdrawalService.ts
│   │
│   ├───templates
│   │       otpEmail.ts
│   │       resetPasswordEmail.ts
│   │       welcomeEmail.ts
│   │
│   └───utils
│           jwt.ts
│           logger.ts
│           password.ts
│           response.ts
│           securityLogger.ts
│           ua.ts
│
├───shared
│   ├───constants
│   │       index.ts
│   │
│   ├───types
│   │       index.ts
│   │
│   └───validators
│           index.ts
│
└───src
    └───db
            achievements.ts
            activities.ts
            audit.ts
            claims.ts
            deposits.ts
            deposit_addresses.ts
            drizzle.config.ts
            income.ts
            index.ts
            migrate.ts
            notifications.ts
            referrals.ts
            salary.ts
            schema.ts
            sessions.ts
            settings.ts
            support.ts
            team_commission_history.ts
            transactions.ts
            users.ts
            vip.ts
            wallets.ts
            withdrawals.ts