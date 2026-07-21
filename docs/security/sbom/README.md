# Software Bill of Materials (SBOM)

> **Purpose:** Home for MRMS SBOM artifacts and generation instructions.
> **Version:** 1.0
> **Author:** MRMS Engineering Team - PT Mitra Prodin
> **Last Updated:** 2026-07-21

---

## Status

A machine-readable CycloneDX SBOM is scheduled to be generated in CI. In this
certification pass, the **production dependency + license inventory** was
captured via `pnpm licenses list --prod` and analyzed in
[../LICENSE-COMPLIANCE.md](../LICENSE-COMPLIANCE.md). Vulnerability references are
captured in the [dependency security audit](../../reports/sprint-1a/dependency-security-audit.md).

## Generate a CycloneDX SBOM

```bash
# From repo root (CycloneDX for pnpm workspaces):
npx --yes @cyclonedx/cyclonedx-npm --output-format JSON \
  --output-file docs/security/sbom/mrms-sbom.cdx.json

# Or, ecosystem-agnostic (also captures OS/other components):
npx --yes @cyclonedx/cdxgen -o docs/security/sbom/mrms-sbom.cdx.json
```

The SBOM should include, per component: package name, version, license,
dependency relationships, and (via the audit) known vulnerability references.

## CI integration (planned)

- Add an SBOM job that generates `mrms-sbom.cdx.json` on release branches and
  uploads it as a build artifact.
- Optionally attach the SBOM to GitHub Releases for supply-chain traceability.

Tracked as a follow-up in the technical backlog.
