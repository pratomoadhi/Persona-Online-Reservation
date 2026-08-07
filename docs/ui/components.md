# Reusable Components

Persona uses **shadcn/ui** as the component library, built on **Radix UI** primitives and styled with **Tailwind CSS**.

---

# Component Categories

## Layout Components

### Header

Sticky top navigation bar.

**Props:**

- `logo` — Brand logo
- `navItems` — Navigation links
- `userMenu` — User dropdown (authenticated)
- `authButtons` — Login/Sign Up buttons (guest)

### Footer

Site footer with links and legal information.

**Props:**

- `links` — Footer link groups
- `socialLinks` — Social media icons
- `copyright` — Copyright text

### Container

Centered content wrapper with responsive max-width.

**Props:**

- `maxWidth` — `sm`, `md`, `lg`, `xl`, `2xl`
- `padding` — Padding scale token

---

## Navigation Components

### NavLink

Navigation link with active state.

**Props:**

- `href` — Destination URL
- `label` — Link text
- `active` — Active state
- `icon` — Optional icon

### BottomNav

Mobile bottom navigation bar.

**Props:**

- `items` — Array of `{ icon, label, href }`
- `activePath` — Current active path

### Breadcrumb

Shows current page hierarchy.

**Props:**

- `items` — Array of `{ label, href }`

---

## Feedback Components

### Button

Primary interactive element.

**Variants:**

- `default` — Primary action
- `secondary` — Secondary action
- `outline` — Bordered action
- `ghost` — Subtle action
- `destructive` — Destructive action
- `link` — Text link

**Sizes:**

- `sm`, `default`, `lg`, `icon`

**Props:**

- `variant` — Button variant
- `size` — Button size
- `loading` — Loading state
- `disabled` — Disabled state
- `icon` — Leading icon

### Badge

Small status indicator.

**Variants:**

- `default`, `secondary`, `outline`, `success`, `warning`, `danger`

**Props:**

- `variant` — Badge variant
- `children` — Badge content

### Alert

Inline notification for important information.

**Variants:**

- `info`, `success`, `warning`, `danger`

**Props:**

- `variant` — Alert variant
- `title` — Alert title
- `children` — Alert content

### Toast

Transient notification for user actions.

**Props:**

- `title` — Toast title
- `description` — Toast description
- `variant` — `default`, `success`, `danger`

### Skeleton

Loading placeholder.

**Props:**

- `className` — Width/height classes

---

## Form Components

### Input

Text input field.

**Props:**

- `label` — Field label
- `placeholder` — Placeholder text
- `error` — Error message
- `type` — Input type
- `disabled` — Disabled state

### Textarea

Multi-line text input.

**Props:**

- `label` — Field label
- `placeholder` — Placeholder text
- `error` — Error message
- `rows` — Number of rows

### Select

Dropdown selection.

**Props:**

- `label` — Field label
- `options` — Array of `{ value, label }`
- `placeholder` — Placeholder text
- `error` — Error message

### Checkbox

Boolean selection.

**Props:**

- `label` — Field label
- `checked` — Checked state
- `onChange` — Change handler

### DatePicker

Date selection input.

**Props:**

- `label` — Field label
- `value` — Selected date
- `onChange` — Change handler
- `minDate` — Minimum selectable date

### TimePicker

Time selection input.

**Props:**

- `label` — Field label
- `value` — Selected time
- `onChange` — Change handler

### FormField

Wrapper for form fields with label and error.

**Props:**

- `label` — Field label
- `error` — Error message
- `required` — Required indicator
- `children` — Form control

---

## Data Display Components

### Avatar

User or persona profile image.

**Props:**

- `src` — Image URL
- `alt` — Alt text
- `size` — `sm`, `md`, `lg`, `xl`
- `fallback` — Initials fallback

### Card

Container for grouped content.

**Props:**

- `title` — Card title
- `description` — Card description
- `footer` — Card footer content
- `children` — Card body content

### PersonaCard

Displays a persona summary.

**Props:**

- `persona` — Persona data object
- `onView` — View profile handler

### RatingStars

Displays star rating.

**Props:**

- `rating` — Numeric rating (0-5)
- `count` — Number of reviews
- `size` — Star size

### SkillTag

Displays a skill label.

**Props:**

- `name` — Skill name
- `level` — Skill level (optional)

### AvailabilitySlot

Displays an availability time slot.

**Props:**

- `startTime` — Slot start
- `endTime` — Slot end
- `isBooked` — Booked status
- `onBook` — Book handler

### ReviewItem

Displays a single review.

**Props:**

- `review` — Review data object

### StatCard

Displays a metric/statistic.

**Props:**

- `label` — Statistic label
- `value` — Statistic value
- `icon` — Optional icon
- `trend` — Optional trend indicator

---

## Overlay Components

### Modal

Dialog overlay for focused interactions.

**Props:**

- `open` — Open state
- `onClose` — Close handler
- `title` — Modal title
- `description` — Modal description
- `children` — Modal content
- `footer` — Modal footer

### Dialog

Confirmation dialog.

**Props:**

- `open` — Open state
- `onClose` — Close handler
- `title` — Dialog title
- `description` — Dialog description
- `confirmLabel` — Confirm button text
- `cancelLabel` — Cancel button text
- `onConfirm` — Confirm handler

### DropdownMenu

Contextual action menu.

**Props:**

- `trigger` — Trigger element
- `items` — Menu items
- `align` — Alignment

### Tooltip

Hover information display.

**Props:**

- `content` — Tooltip content
- `children` — Trigger element

---

## Navigation Guards

### ProtectedRoute

Route wrapper requiring authentication.

**Props:**

- `roles` — Allowed roles
- `children` — Protected content

### PublicOnlyRoute

Route wrapper for guests only.

**Props:**

- `children` — Public content

---

# Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── NavLink[]
│   └── UserMenu / AuthButtons
├── Main
│   ├── PageContent
│   │   ├── PersonaCard[]
│   │   ├── AvailabilitySlot[]
│   │   └── ReviewItem[]
│   └── Modals
│       ├── BookingModal
│       └── ConfirmDialog
├── Footer
│   ├── LinkGroup[]
│   └── SocialLinks
└── ToastProvider
```

---

# State Management

- **Server State:** TanStack Query
- **Client State:** React Context
- **Form State:** React Hook Form
- **Validation:** Zod schemas

---

# Accessibility

All components follow:

- ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader labels
- Color contrast compliance

---