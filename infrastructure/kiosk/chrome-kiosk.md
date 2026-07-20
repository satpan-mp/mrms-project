# Intel NUC Chrome Kiosk Setup (Reference)

Guidance for provisioning a meeting-room Intel NUC (Windows) to run the MRMS
Display in Chrome Kiosk mode. This is operational reference documentation; the
device agent (heartbeat/telemetry) lives alongside in `device-agent/`.

> Detailed design rationale: `docs/11-Google-Meet-Integration-Flow.md` and
> `docs/06-High-Level-Architecture-Diagram.md`.

## 1. Goals

- Auto-login -> Chrome auto-start -> Kiosk (fullscreen) -> open the room Display URL.
- Zero interaction required to show the schedule.
- Google account pre-signed-in with webcam/mic permissions pre-granted for
  `meet.google.com` (and Zoom domains).

## 2. Windows Auto-Login

Configure automatic sign-in for the dedicated kiosk user (via `netplwiz` or the
appropriate MDM/Group Policy). Use a low-privilege local account dedicated to the
display.

## 3. Chrome Auto-Start in Kiosk Mode

Create a startup shortcut / scheduled task launching Chrome with kiosk flags:

```
chrome.exe ^
  --kiosk ^
  --app="https://<mrms-host>/display/?room=<ROOM_ID>&token=<DEVICE_TOKEN>" ^
  --start-fullscreen ^
  --noerrdialogs ^
  --disable-session-crashed-bubble ^
  --disable-infobars ^
  --autoplay-policy=no-user-gesture-required
```

- Replace `<mrms-host>`, `<ROOM_ID>`, `<DEVICE_TOKEN>` per room.
- The device token is room-scoped and revocable (see `docs/12-Authentication-Flow.md`).

## 4. Camera / Microphone Permissions

Pre-grant media permissions so Meet/Zoom never prompt. Use Chrome enterprise
policy (`VideoCaptureAllowedUrls`, `AudioCaptureAllowedUrls`) to allow the Meet
and Zoom origins for the kiosk profile.

## 5. Popups / New Windows

Join Meeting / Join Zoom open a new Chrome window. Ensure kiosk policy permits
popups for `meet.google.com` and Zoom domains (`PopupsAllowedForUrls`).

## 6. Recovery

- Configure Chrome to restore/relaunch on crash.
- The MRMS device agent reports Chrome/display running state via heartbeat so the
  Admin Panel can detect a stuck or offline kiosk.

## 7. Time Sync

Ensure NTP time sync is enabled; accurate time is required for correct room
status computation.

> These steps are a reference checklist. Exact provisioning (MDM, Group Policy,
> imaging) is finalized during deployment (Phase P8).
