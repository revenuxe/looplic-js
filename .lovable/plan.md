
## Plan

### 1. Database Changes
- Add `repair_subcategories` table (id, category_id, name, image_url, price)
- Add RLS policies for public read + admin write
- Link bookings to subcategories

### 2. Admin Panel Updates
- Add Subcategories management tab under Mobile Repair & Laptop Repair
- CRUD for subcategories with image upload, linked to parent category

### 3. User Authentication & Booking System
- Create Login/Signup page with email+password (appears during booking or from My Account)
- Add `user_id` to bookings table (nullable, for logged-in users)
- Create My Account page with:
  - Profile info
  - Booking history with status tabs: All, Booked, Confirmed, In Progress, Completed, Cancelled
- Auth appears as a modal/page during booking flow if not logged in

### 4. Homepage Fix
- Replace last brand card in 3rd row with "Show More" button (not a new row)

### 5. Routes
- `/account` - My Account (protected)
- `/account/bookings` - Booking history
- `/login` - Login/Signup page
