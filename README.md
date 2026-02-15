# Table Ordering SaaS Frontend

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Icons**: Lucide React
- **State**: Zustand (with Persist middleware)
- **Language**: TypeScript

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  **Open the app**:
    - Landing: [http://localhost:3000](http://localhost:3000)
    - Demo Restaurant: [http://localhost:3000/demo-grill/order](http://localhost:3000/demo-grill/order)

## Features
- **Multi-tenant Architecture**: `[restaurantSlug]` routing.
- **Table Management**: Enter table number to start ordering.
- **Menu System**: Categories, Items, Spice Levels, Modifiers.
- **Cart**: Add/Remove items, update quantities, calculate total.
- **Responsive**: Mobile-first design.
- **Theme**: Warm colors (Orange) for restaurant vibe.

## Folder Structure
- `src/app`: Routes and Pages.
- `src/components`: Custom UI components (`MenuItemCard`, `Cart` etc.).
- `src/components/ui`: shadcn/ui components.
- `src/lib`: Utilities, Types, Mock Data.
- `src/store`: Application state (Cart).

## Future Improvements
- Integrate Firebase for real data.
- Add backend for order processing.
- Implement real payment gateway.
