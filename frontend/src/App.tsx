import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SplashScreen, shouldShowSplash } from "./components/SplashScreen";
import { Home } from "./pages/Home";
import { Directions } from "./pages/Directions";
import { Gifts } from "./pages/Gifts";
import { PhotoWall } from "./pages/PhotoWall";
import { RSVP } from "./pages/RSVP";
import { RsvpLookup } from "./pages/RsvpLookup";
import { OurStory } from "./pages/OurStory";
import { OrderOfTheDay } from "./pages/OrderOfTheDay";
import { Photoshoot } from "./pages/Photoshoot";
import { Wishes } from "./pages/Wishes";
import { HotelReservation } from "./pages/HotelReservation";
import { AdminLogin } from "./pages/admin/Login";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminGuests } from "./pages/admin/Guests";
import { AdminPhotos } from "./pages/admin/Photos";
import { AdminSettings } from "./pages/admin/Settings";
import { AdminWishes } from "./pages/admin/Wishes";
import { AdminHotelReservations } from "./pages/admin/HotelReservations";

function App() {
  const [showSplash, setShowSplash] = useState(shouldShowSplash);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="rsvp" element={<RsvpLookup />} />
          <Route path="rsvp/:slug" element={<RSVP />} />
          <Route path="our-story" element={<OurStory />} />
          <Route path="directions" element={<Directions />} />
          <Route path="order-of-the-day" element={<OrderOfTheDay />} />
          <Route path="photoshoot" element={<Photoshoot />} />
          <Route path="gifts" element={<Gifts />} />
          <Route path="photos" element={<PhotoWall />} />
          <Route path="wishes" element={<Wishes />} />
          <Route path="hotel" element={<HotelReservation />} />
        </Route>

        <Route path="admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/guests" element={<AdminGuests />} />
            <Route path="admin/photos" element={<AdminPhotos />} />
            <Route path="admin/wishes" element={<AdminWishes />} />
            <Route path="admin/hotel-reservations" element={<AdminHotelReservations />} />
            <Route path="admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
