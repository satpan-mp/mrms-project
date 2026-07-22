/**
 * Catalog domain event types + aggregate type names (frozen envelope, version 1).
 *
 * Event names are stable, dotted, and past-tense. Consumers switch on
 * `(eventType, eventVersion)`. Bumping a payload's shape in a breaking way
 * requires incrementing its version, not renaming the event.
 */

export const CATALOG_EVENT_VERSION = 1 as const;

export const CatalogAggregateType = {
  Site: 'Site',
  Facility: 'Facility',
  Room: 'Room',
} as const;

export const CatalogEventType = {
  SiteCreated: 'catalog.site.created',
  SiteUpdated: 'catalog.site.updated',
  SiteDeleted: 'catalog.site.deleted',
  FacilityCreated: 'catalog.facility.created',
  FacilityUpdated: 'catalog.facility.updated',
  FacilityDeleted: 'catalog.facility.deleted',
  RoomCreated: 'catalog.room.created',
  RoomUpdated: 'catalog.room.updated',
  RoomDeleted: 'catalog.room.deleted',
  RoomFacilitiesChanged: 'catalog.room.facilities_changed',
} as const;
