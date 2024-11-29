# Damaru Project

## Overview
Damaru is a system designed for screen sharing and emulator management using WebRTC. It consists of three main components:

- **Server App**: Installed on emulator devices, it manages device registration and screen streaming.
- **Client UserEntity App**: Provides users with account management, screen streaming, and control functionality.
- **Admin App**: Enables administrators to manage emulators and users.

## Packages
- **com.powersoft.damaruclient**: For the Client UserEntity App.
- **com.powersoft.damaruserver**: For the Server App.
- **com.powersoft.damaruadmin**: For the Admin App.

---

## Server App (Android App)

### Initial Request
On the first launch:
1. The app sends a request to the server with the `device_id`.
2. The server checks the device's assignment status:
    - **Assigned**: No action is taken.
    - **Unassigned**: The device is marked as free, available for later assignment.

### Features
- **Screen Sharing**: Streams the device screen via WebRTC.
- **Signaling Server Connection**: Connects to a signaling server to establish WebRTC sessions.

---

## Client UserEntity App (Android App)

### Authentication
- Users log in using Gmail.

### Account Management
- Display a list of user profiles (similar to Netflix).
- Users select a profile and enter a PIN to log in.
- Accounts can be shared with multiple users.

### Admin Features (for main users/admins)
1. **UserEntity Management**:
    - Perform CRUD operations on the list of connected users.
2. **Emulator Management**:
    - Add an emulator using a code generated from the Admin App (code verification required).
3. **Activity Logs**:
    - View detailed logs, including:
        - Actions such as opening the app, entering PINs, using emulators, and logging off.
        - Date and time of each action.
        - `device_id` and `device_name`.

### Screen Streaming
- Users can initiate screen streaming for emulators via WebRTC.
- Stream is established by connecting to the signaling server.

### Controls and Disconnection
1. **ADB Commands**: Enable emulator control.
2. **Disconnection Handling**:
    - Call an API to unlink the emulator when explicitly disconnected.
    - Implement session timeout to handle cases when users leave the app without disconnecting.

---

## Admin App (Android App)

### Authentication
- Admins log in using Gmail.

### Emulator Management
1. **View Emulators**:
    - Display all emulators.
    - Filter emulators by status: Available or Registered.
2. **Generate Codes**:
    - Generate codes for available emulators to link them with the Client UserEntity App.

---

## Security
- All API requests and responses are encrypted.

---

## Notes
This README provides an initial draft of the system. Features and functionality are subject to further development and iteration.
