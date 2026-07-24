import type { Inspection, MaintenanceInterval, Vehicle } from "./domain";
export const vehicles:Vehicle[]=[
{id:"VEH-104",unit:"104",plate:"8KX-291",makeModel:"2022 Ford Transit",odometer:68421,status:"blocked"},
{id:"VEH-207",unit:"207",plate:"4NP-772",makeModel:"2023 Isuzu NRR",odometer:42218,status:"ready"},
{id:"VEH-318",unit:"318",plate:"9RM-144",makeModel:"2021 Ram ProMaster",odometer:91108,status:"attention"},
{id:"VEH-411",unit:"411",plate:"6BQ-905",makeModel:"2024 Ford E-Transit",odometer:18804,status:"ready"}];
export const intervals:MaintenanceInterval[]=[
{id:"INT-1",vehicleId:"VEH-104",serviceType:"Brake service",dueOdometer:68000,critical:true},
{id:"INT-2",vehicleId:"VEH-104",serviceType:"Oil service",dueOdometer:70000,critical:false},
{id:"INT-3",vehicleId:"VEH-207",serviceType:"DOT inspection",dueOdometer:45000,critical:true},
{id:"INT-4",vehicleId:"VEH-318",serviceType:"Tire rotation",dueOdometer:90000,critical:false}];
export const inspections:Inspection[]=[
{id:"INSP-9081",vehicleId:"VEH-104",submittedAt:"2026-07-24T06:42:00.000Z",safetyFlags:["Brake system concern"],reviewed:false},
{id:"INSP-9080",vehicleId:"VEH-207",submittedAt:"2026-07-24T07:05:00.000Z",safetyFlags:[],reviewed:true},
{id:"INSP-9079",vehicleId:"VEH-318",submittedAt:"2026-07-24T05:28:00.000Z",safetyFlags:[],reviewed:true},
{id:"INSP-9078",vehicleId:"VEH-411",submittedAt:"2026-07-24T07:14:00.000Z",safetyFlags:[],reviewed:true}];
export const activity=[{time:"07:14",unit:"411",event:"Inspection cleared",actor:"Nora Hale"},{time:"07:05",unit:"207",event:"Dispatch gate passed",actor:"System"},{time:"06:49",unit:"104",event:"Dispatch blocked",actor:"System"},{time:"06:42",unit:"104",event:"Brake concern reported",actor:"J. Reyes"}];
