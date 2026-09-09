/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Reck Companion - Mobile Core Application
 * Central state router, navigation orchestrator, and modal supervisor.
 */

import React from 'react';
import { ReckProvider, useReck } from './context/ReckContext';
import { DeviceFrame } from './components/common/DeviceFrame';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { MenuDrawer } from './components/common/MenuDrawer';

// Primary Views
import { HomeScreen } from './components/views/HomeScreen';
import { TextChatView } from './components/views/TextChatView';
import { CallReckView } from './components/views/CallReckView';
import { DevicesView } from './components/views/DevicesView';
import { TasksView } from './components/views/TasksView';
import { MemoryView } from './components/views/MemoryView';
import { AutomationsView } from './components/views/AutomationsView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { GmailView } from './components/views/GmailView';
import { WorkspaceHubView } from './components/views/WorkspaceHubView';
import { FirebaseDbView } from './components/views/FirebaseDbView';
import { TrustCenterView } from './components/views/TrustCenterView';
import { PermissionCenterView } from './components/views/PermissionCenterView';
import { NotificationsView } from './components/views/NotificationsView';
import { SettingsView } from './components/views/SettingsView';
import { AccountView } from './components/views/AccountView';
import { DiagnosticsView } from './components/views/DiagnosticsView';

// Modals
import { DeviceDetailModal } from './components/views/DeviceDetailModal';
import { RemoteCommandModal } from './components/views/RemoteCommandModal';
import { BiometricApprovalModal } from './components/views/BiometricApprovalModal';
import { TaskDetailModal } from './components/views/TaskDetailModal';
import { PairingModal } from './components/views/PairingModal';
import { FileViewerModal } from './components/views/FileViewerModal';

const AppContent: React.FC = () => {
  const { activeScreen } = useReck();

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      case 'chat':
        return <TextChatView />;
      case 'call':
        return <CallReckView />;
      case 'devices':
        return <DevicesView />;
      case 'tasks':
        return <TasksView />;
      case 'memory':
        return <MemoryView />;
      case 'automations':
        return <AutomationsView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'gmail':
        return <GmailView />;
      case 'workspace':
        return <WorkspaceHubView />;
      case 'firebase_db':
        return <FirebaseDbView />;
      case 'trust_center':
        return <TrustCenterView />;
      case 'permissions':
        return <PermissionCenterView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      case 'account':
        return <AccountView />;
      case 'diagnostics':
        return <DiagnosticsView />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <DeviceFrame>
      <div className="flex flex-col h-full w-full bg-[#07090e] text-slate-100 relative overflow-hidden select-none">
        {/* Top Header Bar */}
        <Header />

        {/* Scrollable Viewport */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative z-10 no-scrollbar">
          {renderActiveScreen()}
        </main>

        {/* Bottom Persistent Navigation Bar */}
        <Navigation />

        {/* Slide-out Menu Drawer */}
        <MenuDrawer />

        {/* Universal Modals & Overlays */}
        <DeviceDetailModal />
        <RemoteCommandModal />
        <BiometricApprovalModal />
        <TaskDetailModal />
        <PairingModal />
        <FileViewerModal />
      </div>
    </DeviceFrame>
  );
};

export default function App() {
  return (
    <ReckProvider>
      <AppContent />
    </ReckProvider>
  );
}

