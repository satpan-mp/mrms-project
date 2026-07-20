# Device Agent (placeholder)

A lightweight Windows agent that runs on each Intel NUC and periodically POSTs a
heartbeat with telemetry to the MRMS backend:

- CPU / RAM / storage usage
- Internet status, Chrome running, Display running
- Webcam / microphone / TV connected
- Last calendar sync timestamp

See `docs/09-API-Specification.md` (`POST /devices/{roomId}/heartbeat`) and
`docs/16-Backend-Architecture.md` (Monitoring module). Implemented in Sprint 10
(Phase P6). No agent code exists yet - repository initialization only.
