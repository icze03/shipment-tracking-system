# **App Name**: TruckTrack

## Core Features:

- Driver Dashboard: Mobile-first UI with large buttons for status updates: 'Arrived at Warehouse', 'Start Loading', 'End Loading', 'Departed Warehouse', 'Arrived at Destination', 'Delivered', 'Returned to Origin', 'Trip Completed'. Captures shipmentId, driverId, statusType, and serverTimestamp upon each button press. Locks record from driver edits and updates admin dashboard in real-time.
- Admin Dashboard: Provides shipment management (create shipment, auto-generate order code, assign driver, define trip stages) and a monitoring dashboard (table view of all shipments with status timestamps and visual progress indicators).
- Customer Tracking: Public page where customers can track shipment status using an order code. Displays completed statuses with timestamps and pending statuses on a clean timeline without requiring login.
- Excel Export: Allows admin to export data to Excel, formatted for structured reporting, including shipment info and status timestamps as columns.
- Data Audit Tool: AI-powered tool that assists the admin in editing incorrect timestamps and adding notes, tracking changes via an audit log.
- Secure Firestore Database: Clean, normalized schema for users, shipments, and statusLogs. Implements security rules to restrict driver access to assigned shipments, allow admins full read/write access, and provide customers with read-only access via orderCode lookup.

## Style Guidelines:

- Primary color: Strong blue (#2962FF) for reliability and trust, inspired by logistics and professionalism.
- Background color: Light grey (#F0F4F9) to ensure clarity and readability for long hours of use, complements the primary blue.
- Accent color: Vivid orange (#FF7733) to draw attention to important actions and updates, creates contrast and a sense of urgency.
- Body and headline font: 'Inter', a grotesque-style sans-serif, was chosen for both headlines and body text due to its modern, machined, objective, neutral look, which will improve readability for drivers and admins.
- Use clear, universal icons to represent different statuses and actions. Icons should be high-contrast and easily recognizable.
- Mobile-first design with large, high-contrast buttons to minimize cognitive load and ensure fatigue-safe operation for drivers.
- Subtle animations and transitions to provide clear feedback on user actions without being distracting.