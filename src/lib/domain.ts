export type Role = "driver" | "dispatcher" | "maintenance_manager" | "fleet_admin";
export type Vehicle = { id:string; unit:string; plate:string; makeModel:string; odometer:number; status:"ready"|"attention"|"blocked" };
export type MaintenanceInterval = { id:string; vehicleId:string; serviceType:string; dueOdometer:number; critical:boolean };
export type Inspection = { id:string; vehicleId:string; submittedAt:string; safetyFlags:string[]; reviewed:boolean };
export type InspectionDraft = { tires:string; brakes:string; lights:string; fluids:string; body:string; safetyFlags:string[]; reviewRequired:true };

export function evaluateDispatchGate(vehicle:Vehicle, intervals:MaintenanceInterval[], inspection?:Inspection, now=new Date()) {
  const reasons:string[]=[];
  const overdue=intervals.filter((item)=>item.vehicleId===vehicle.id&&item.critical&&vehicle.odometer>=item.dueOdometer);
  reasons.push(...overdue.map((item)=>`${item.serviceType} overdue by ${vehicle.odometer-item.dueOdometer} miles`));
  if(!inspection) reasons.push("No driver inspection is on file");
  else {
    const ageHours=(now.getTime()-new Date(inspection.submittedAt).getTime())/3_600_000;
    if(ageHours>24) reasons.push("Driver inspection is older than 24 hours");
    if(!inspection.reviewed) reasons.push(...inspection.safetyFlags.map((flag)=>`Open safety flag: ${flag}`));
  }
  return {canDispatch:reasons.length===0,reasons,evaluatedAt:now.toISOString()};
}

export function authorizeDispatchOverride(role:Role, physicalVerification:boolean, justification:string) {
  if(role!=="maintenance_manager"&&role!=="fleet_admin") return {allowed:false,reason:"Only maintenance leadership can authorize a dispatch override."};
  if(!physicalVerification) return {allowed:false,reason:"Physical verification is required before an override."};
  if(justification.trim().length<30) return {allowed:false,reason:"Provide a specific justification of at least 30 characters."};
  return {allowed:true as const};
}

const sections={tires:/\b(tire|tyre|tread|flat|pressure|sidewall)\b/i,brakes:/\b(brake|rotor|pad|stopping|pedal)\b/i,lights:/\b(light|lamp|signal|indicator|headlight|taillight)\b/i,fluids:/\b(oil|fluid|coolant|leak|washer)\b/i,body:/\b(body|mirror|glass|windshield|door|dent|bumper)\b/i};
export function groundedInspectionDraft(notes:string):InspectionDraft {
  const normalized=notes.trim();
  const valueFor=(pattern:RegExp)=>pattern.test(normalized)?normalized:"Not reported";
  const safetyFlags=[[/\b(flat|blowout|cord showing|tire damage)\b/i,"Unsafe tire condition"],[/\b(brake failure|soft brake|grinding|won't stop|cannot stop)\b/i,"Brake system concern"],[/\b(steering loose|steering failure)\b/i,"Steering concern"],[/\b(fuel leak|oil leak|coolant leak|active leak)\b/i,"Active fluid leak"]].filter(([pattern])=>(pattern as RegExp).test(normalized)).map(([,label])=>label as string);
  return {tires:valueFor(sections.tires),brakes:valueFor(sections.brakes),lights:valueFor(sections.lights),fluids:valueFor(sections.fluids),body:valueFor(sections.body),safetyFlags,reviewRequired:true};
}

export function completeMaintenance(intervals:MaintenanceInterval[],vehicleId:string,serviceType:string,completedOdometer:number,nextIntervalMiles:number){
  let matched=false;
  const updated=intervals.map((item)=>{if(item.vehicleId!==vehicleId||item.serviceType.toLowerCase()!==serviceType.toLowerCase())return item;matched=true;return{...item,dueOdometer:completedOdometer+nextIntervalMiles}});
  return {matched,intervals:updated};
}
