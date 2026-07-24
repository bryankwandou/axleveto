import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { inspections, intervals, vehicles } from "@/lib/demo-data";
import { evaluateDispatchGate } from "@/lib/domain";

const schema=z.object({message:z.string().min(3).max(1200)});
const evaluatedAt=new Date("2026-07-24T09:00:00.000Z");

function fleetContext(){
  return vehicles.map(vehicle=>{
    const inspection=inspections.find(item=>item.vehicleId===vehicle.id);
    const decision=evaluateDispatchGate(vehicle,intervals,inspection,evaluatedAt);
    return {unit:vehicle.unit,vehicle_id:vehicle.id,make_model:vehicle.makeModel,odometer:vehicle.odometer,can_dispatch:decision.canDispatch,reasons:decision.reasons,latest_inspection:inspection??null,maintenance_intervals:intervals.filter(item=>item.vehicleId===vehicle.id)};
  });
}

function fallback(message:string){
  const fleet=fleetContext();
  const unitMatch=message.match(/(?:unit\s*)?(104|207|318|411)/i)?.[1];
  const selected=unitMatch?fleet.find(item=>item.unit===unitMatch):fleet.find(item=>!item.can_dispatch);
  if(selected)return {answer:selected.can_dispatch?`Unit ${selected.unit} is cleared by the dispatch gate.`:`Unit ${selected.unit} is blocked. ${selected.reasons.join(" ")}`,recommended_actions:selected.can_dispatch?["Keep the current inspection attached to dispatch."]:["Keep the unit out of dispatch.","Resolve each listed safety reason.","Re-run the server gate after maintenance review."],evidence:selected.reasons.length?selected.reasons:["No blocking reason returned by the gate."],tools_used:["evaluate_dispatch_gate","read_inspection_evidence","read_maintenance_intervals"]};
  return {answer:"The fleet snapshot is available, but I need a unit number or operational question to make a grounded recommendation.",recommended_actions:["Ask about a specific unit or the current blocked fleet."],evidence:[],tools_used:["fleet_snapshot"]};
}

export async function POST(request:Request){
  const parsed=schema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"A meaningful operations question is required."},{status:400});
  const context=fleetContext();
  if(!process.env.GROQ_API_KEY)return NextResponse.json({...fallback(parsed.data.message),engine:"deterministic-agent",evaluated_at:evaluatedAt.toISOString()});
  try{
    const groq=new Groq({apiKey:process.env.GROQ_API_KEY});
    const completion=await groq.chat.completions.create({model:process.env.GROQ_MODEL||"llama-3.3-70b-versatile",temperature:0,response_format:{type:"json_object"},messages:[{role:"system",content:"You are AxleVeto Operations Agent. Answer only from the supplied fleet snapshot. Never clear a blocked vehicle, invent maintenance, or imply an unreported system passed. Return JSON keys answer, recommended_actions, evidence, tools_used. All three list fields must be arrays of strings. Keep the answer concise and operational."},{role:"user",content:JSON.stringify({question:parsed.data.message,fleet_snapshot:context,available_tools:["evaluate_dispatch_gate","read_inspection_evidence","read_maintenance_intervals"]})}]});
    const raw=JSON.parse(completion.choices[0]?.message?.content||"{}");
    return NextResponse.json({answer:typeof raw.answer==="string"?raw.answer:fallback(parsed.data.message).answer,recommended_actions:Array.isArray(raw.recommended_actions)?raw.recommended_actions:[],evidence:Array.isArray(raw.evidence)?raw.evidence:[],tools_used:Array.isArray(raw.tools_used)?raw.tools_used:["fleet_snapshot"],engine:"groq-operations-agent",evaluated_at:evaluatedAt.toISOString()});
  }catch{return NextResponse.json({...fallback(parsed.data.message),engine:"deterministic-agent-fallback",evaluated_at:evaluatedAt.toISOString()})}
}