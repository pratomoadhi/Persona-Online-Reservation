# Design System

Persona follows a **mobile-first** design approach with a clean, modern aesthetic.

---

# Design Principles

- **Simplicity** — Clean layouts with minimal visual noise
- **Clarity** — Clear hierarchy and readable typography
- **Consistency** — Reusable components and patterns
- **Accessibility** — WCAG 2.1 AA compliance
- **Responsive** — Mobile-first, desktop-enhanced

---

# Color Palette

## Primary Colors

| Token          | Hex       | Usage                          |
|----------------|-----------|--------------------------------|
| primary        | `#4F46E5` | Buttons, links, active states  |
| primary-dark   | `#4338CA` | Hover states                   |
| primary-light  | `#EEF2FF` | Backgrounds, highlights        |

## Neutral Colors

| Token          | Hex       | Usage                          |
|----------------|-----------|--------------------------------|
| background     | `#FFFFFF` | Page background                |
| surface        | `#F9FAFB` | Cards, panels                  |
| border         | `#E5E7EB` | Borders, dividers              |
| text-primary   | `#111827` | Headings, primary text         |
| text-secondary | `#6B7280` | Secondary text                 |
| text-muted     | `#9CA3AF` | Placeholder, disabled          |

## Semantic Colors

| Token          | Hex       | Usage                          |
|----------------|-----------|--------------------------------|
| success        | `#10B981` | Success states                 |
| warning        | `#F59E0B` | Warning states                 |
| danger         | `#EF4444` | Errors, destructive actions    |
| info           | `#3B82F6` | Informational states           |

---

# Typography

## Font Family

- **Primary:** Inter (sans-serif)
- **Fallback:** system-ui, -apple-system, sans-serif

## Type Scale

| Token        | Size    | Weight | Line Height | Usage                    |
|--------------|---------|--------|-------------|--------------------------|
| display      | 48px    | 700    | 1.2         | Landing page hero        |
| heading-1    | 36px    | 700    | 1.3         | Page titles              |
| heading-2    | 30px    | 600    | 1.3         | Section titles           |
| heading-3    | 24px    | 600    | 1.4         | Card titles              |
| heading-4    | 20px    | 600    | 1.4         | Subsection titles        |
| body-large   | 18px    | 400    | 1.6         | Lead paragraphs          |
| body         | 16px    | 400    | 1.6         | Default body text        |
| body-small   | 14px    | 400    | 1.5         | Secondary text           |
| caption      | 12px    | 400    | 1.5         | Labels, timestamps       |

---

# Spacing

## Spacing Scale

| Token  | Value  |
|--------|--------|
| space-1| 4px    |
| space-2| 8px    |
| space-3| 12px   |
| space-4| 16px   |
| space-5| 20px   |
| space-6| 24px   |
| space-8| 32px   |
| space-10| 40px  |
| space-12| 48px  |
| space-16| 64px  |

---

# Border Radius

| Token        | Value  | Usage                    |
|--------------|--------|--------------------------|
| radius-sm    | 4px    | Small elements           |
| radius-md    | 8px    | Buttons, inputs          |
| radius-lg    | 12px   | Cards, modals            |
| radius-full  | 9999px | Avatars, pills           |

---

# Shadows

| Token        | Value                                      | Usage              |
|--------------|--------------------------------------------|--------------------|
| shadow-sm    | `0 1px 2px rgba(0,0,0,0.05)`               | Subtle elevation   |
| shadow-md    | `0 4px 6px rgba(0,0,0,0.07)`               | Cards              |
| shadow-lg    | `0 10px 15px rgba(0,0,0,0.1)`              | Modals, dropdowns  |
| shadow-xl    | `0 20px 25px rgba(0,0,0,0.15)`             | Floating elements  |

---

# Breakpoints

| Breakpoint | Width     | Device          |
|------------|-----------|-----------------|
| sm         | 640px     | Mobile landscape|
| md         | 768px     | Tablet          |
| lg         | 1024px    | Desktop         |
| xl         | 1280px    | Large desktop   |
| 2xl        | 1536px    | Extra large     |

---

# Icons

- Library: **Lucide Icons**
- Size: 16px (default), 20px (buttons), 24px (navigation)
- Stroke: 2px

---

# Motion

## Durations

| Token        | Value  |
|--------------|--------|
| duration-fast| 150ms  |
| duration-base| 300ms  |
| duration-slow| 500ms  |

## Easing

| Token        | Value                          |
|--------------|--------------------------------|
| ease-in-out  | `cubic-bezier(0.4, 0, 0.2, 1)` |
| ease-out     | `cubic-bezier(0, 0, 0.2, 1)`   |

---

# Accessibility

- Minimum contrast ratio: 4.5:1
- Focus states visible on all interactive elements
- Semantic HTML throughout
- ARIA labels on icon-only buttons
- Keyboard navigation support
- Screen reader friendly

---