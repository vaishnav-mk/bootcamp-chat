# Storybook Stories

This directory contains all Storybook stories organized by component category:

## Directory Structure

- **`ui/`** - Basic UI components (Button, Input, LoadingSpinner)
- **`chat/`** - Chat-related components (ConversationItem, UserDropdown, etc.)
- **`providers/`** - Provider components (ToastProvider)

## Available Stories

### UI Components
- `Button.stories.ts` - Button component with different variants
- `Input.stories.ts` - Input component with various states
- `LoadingSpinner.stories.ts` - Loading spinner with different sizes

### Chat Components
- `ConversationItem.stories.tsx` - Individual conversation list items
- `ConversationTypeToggle.stories.ts` - Toggle between direct/group chat types
- `AddMemberInput.stories.ts` - Input component for adding members
- `MemberList.stories.ts` - List of selected members
- `UserDropdown.stories.ts` - User dropdown menu component
- `SidebarHeader.stories.tsx` - Sidebar header with user info

### Provider Components
- `ToastProvider.stories.tsx` - Toast notification provider

## Running Storybook

To view these stories, run:

```bash
npm run storybook
```

Then open http://localhost:6006 in your browser.