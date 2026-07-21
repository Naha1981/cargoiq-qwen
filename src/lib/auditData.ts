export const previousAudits = [
  { id: 1, date: '2025-06-15', shipments: 24, exposure: 142000 },
  { id: 2, date: '2025-05-28', shipments: 18, exposure: 98500 },
  { id: 3, date: '2025-05-10', shipments: 31, exposure: 210000 },
];

export const auditFindings: Record<number, any[]> = {
  1: [
    { shipment: 'SHIP-101', finding: 'Overcharge on Ocean Freight leg', amount: 28500, status: 'open' },
    { shipment: 'SHIP-102', finding: 'Demurrage period disputed — weekend not billable', amount: 18200, status: 'open' },
    { shipment: 'SHIP-103', finding: 'FSC variance detected vs contract rate', amount: 39400, status: 'open' },
    { shipment: 'SHIP-104', finding: 'Duplicate invoice detected', amount: 12000, status: 'open' },
    { shipment: 'SHIP-105', finding: 'Missing cargo manifest for HS review', amount: 0, status: 'info' },
    { shipment: 'SHIP-106', finding: 'Rate card expired during billing window', amount: 44800, status: 'open' },
  ],
  2: [
    { shipment: 'SHIP-201', finding: 'Overcharge on inland haulage', amount: 22400, status: 'open' },
    { shipment: 'SHIP-202', finding: 'Demurrage claim — container not ready', amount: 15300, status: 'open' },
    { shipment: 'SHIP-203', finding: 'Incorrect weight surcharge applied', amount: 26100, status: 'open' },
    { shipment: 'SHIP-204', finding: 'Missing proof of delivery', amount: 0, status: 'info' },
    { shipment: 'SHIP-205', finding: 'Duplicate documentation fee', amount: 34700, status: 'open' },
  ],
  3: [
    { shipment: 'SHIP-301', finding: 'Overcharge on terminal handling', amount: 41200, status: 'open' },
    { shipment: 'SHIP-302', finding: 'Demurrage — customs hold justified', amount: 18900, status: 'open' },
    { shipment: 'SHIP-303', finding: 'FSC above tariff cap', amount: 58300, status: 'open' },
    { shipment: 'SHIP-304', finding: 'Missing insurance certificate', amount: 0, status: 'info' },
    { shipment: 'SHIP-305', finding: 'Rate card mismatch on 3 legs', amount: 35600, status: 'open' },
    { shipment: 'SHIP-306', finding: 'Duplicate invoice — same shipment ref', amount: 23400, status: 'open' },
    { shipment: 'SHIP-307', finding: 'Incorrect zone surcharge', amount: 13600, status: 'open' },
  ],
};
