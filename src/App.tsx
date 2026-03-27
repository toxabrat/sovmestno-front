import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { AuthPage } from './pages/auth/AuthPage'
import { SpaceLandingPrototype } from './pages/landing/SpaceLandingPrototype'
import { CreatorLandingPrototype } from './pages/landing/CreatorLandingPrototype'
import { CreateSpacePage } from './pages/space/CreateSpacePage'
import { SpaceFinalPage } from './pages/space/SpaceFinalPage'
import { SpaceSuccessPage } from './pages/space/SpaceSuccessPage'
import { CreateCreatorPage } from './pages/creator/CreateCreatorPage'
import { CreatorFinalPage } from './pages/creator/CreatorFinalPage'
import { CreatorSuccessPage } from './pages/creator/CreatorSuccessPage'
import { SpacesCatalogPage } from './pages/spaces/SpacesCatalogPage'
import { EventsCatalogPage } from './pages/events/EventsCatalogPage'
import { EventDetailsPage } from './pages/events/EventDetailsPage'
import { CreateEventPage } from './pages/events/CreateEventPage'
import { EventSuccessPage } from './pages/events/EventSuccessPage'
import { CreatorsCatalogPage } from './pages/creators/CreatorsCatalogPage'
import { VenueProfilePage } from './pages/venue/VenueProfilePage'
import { CreatorProfilePage } from './pages/creator/CreatorProfilePage'
import { MyEventsPage } from './pages/my-events/MyEventsPage'
import { NotFoundPage } from './pages/errors/NotFoundPage'
import { CreatorRegistrationProvider } from './context/CreatorRegistrationContext'
import { SpaceRegistrationProvider } from './context/SpaceRegistrationContext'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
    <CreatorRegistrationProvider>
    <SpaceRegistrationProvider>
    <Routes>
      <Route path="/landing/space" element={<SpaceLandingPrototype />} />
      <Route path="/landing/creator" element={<CreatorLandingPrototype />} />

      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/landing/space" replace />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route path="/space/create" element={<CreateSpacePage />} />
        <Route path="/space/final" element={<SpaceFinalPage />} />
        <Route path="/space/success" element={<SpaceSuccessPage />} />

        <Route path="/spaces" element={<SpacesCatalogPage />} />
        <Route path="/events" element={<EventsCatalogPage />} />
        <Route path="/events/create" element={<CreateEventPage />} />
        <Route path="/events/success" element={<EventSuccessPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/creators" element={<CreatorsCatalogPage />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/venue/profile" element={<VenueProfilePage />} />
        <Route path="/venue/profile/:userId" element={<VenueProfilePage />} />
        <Route path="/creator/profile" element={<CreatorProfilePage />} />
        <Route path="/creator/profile/:userId" element={<CreatorProfilePage />} />

        <Route path="/creator/create" element={<CreateCreatorPage />} />
        <Route path="/creator/final" element={<CreatorFinalPage />} />
        <Route path="/creator/success" element={<CreatorSuccessPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </SpaceRegistrationProvider>
    </CreatorRegistrationProvider>
    </AuthProvider>
  )
}
