"use strict";
// AgroConnect — Shared TypeScript Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMISSION_RATES = exports.GHANA_REGIONS = void 0;
exports.GHANA_REGIONS = [
    { id: 1, name: 'Greater Accra', code: 'GA', zone: 'southern' },
    { id: 2, name: 'Ashanti', code: 'AH', zone: 'middle' },
    { id: 3, name: 'Western', code: 'WE', zone: 'southern' },
    { id: 4, name: 'Western North', code: 'WN', zone: 'southern' },
    { id: 5, name: 'Eastern', code: 'ER', zone: 'southern' },
    { id: 6, name: 'Central', code: 'CE', zone: 'southern' },
    { id: 7, name: 'Volta', code: 'VO', zone: 'southern' },
    { id: 8, name: 'Oti', code: 'OT', zone: 'middle' },
    { id: 9, name: 'Bono', code: 'BO', zone: 'middle' },
    { id: 10, name: 'Bono East', code: 'BE', zone: 'middle' },
    { id: 11, name: 'Ahafo', code: 'AF', zone: 'middle' },
    { id: 12, name: 'Brong-Ahafo', code: 'BA', zone: 'middle' },
    { id: 13, name: 'Northern', code: 'NO', zone: 'northern' },
    { id: 14, name: 'Savannah', code: 'SA', zone: 'northern' },
    { id: 15, name: 'North East', code: 'NE', zone: 'northern' },
    { id: 16, name: 'Upper East', code: 'UE', zone: 'northern' },
    { id: 17, name: 'Upper West', code: 'UW', zone: 'northern' },
];
exports.COMMISSION_RATES = {
    direct_purchase: 0.030,
    harvest_pledge: 0.025,
    input_purchase: 0.015,
    input_bnpl: 0,
};
//# sourceMappingURL=index.js.map