"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ExportButtons from '@/components/ExportButtons';

export default function AdminFeedbackPage(){
  const [feedback,setFeedback]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [startDate,setStartDate]=useState('');
  const [endDate,setEndDate]=useState('');
  const [sentimentFilter,setSentimentFilter]=useState('all');

  useEffect(()=>{ async function load(){
    setLoading(true);
    const { data } = await supabase.from('feedback').select('*').order('created_at',{ascending:false});
    setFeedback(data||[]);
    setLoading(false);
  } load(); },[]);

  const filtered = feedback.filter(f=>{
    const date = new Date(f.created_at);
    const matchStart = startDate? date>=new Date(startDate): true;
    const matchEnd = endDate? date<=new Date(endDate): true;
    const matchSentiment = sentimentFilter==='all'? true : (f.sentiment_breakdown?.[sentimentFilter] > 0);
    return matchStart && matchEnd && matchSentiment;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feedback Insights</h1>
      <div className="flex gap-4 items-end">
        <div><label>Start</label><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="border rounded"/></div>
        <div><label>End</label><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="border rounded"/></div>
        <div><label>Sentiment</label>
          <select value={sentimentFilter} onChange={e=>setSentimentFilter(e.target.value)} className="border rounded">
            <option value="all">All</option><option value="positive">Positive</option><option value="neutral">Neutral</option><option value="negative">Negative</option>
          </select>
        </div>
        <div className="ml-auto"><ExportButtons data={filtered} fileName="feedback_insights"/></div>
      </div>

      <div className="bg-white shadow rounded overflow-x-auto">
        {loading? <p className="p-4">Loading...</p> : filtered.length===0? <p className="p-4">No insights</p> :
          <table className="min-w-full"><thead><tr><th>Date</th><th>Summary</th><th>pos</th><th>neu</th><th>neg</th><th>recs</th></tr></thead>
            <tbody>{filtered.map(f=> <tr key={f.id}><td>{new Date(f.created_at).toLocaleString()}</td><td>{f.summary}</td><td>{f.sentiment_breakdown?.positive||0}</td><td>{f.sentiment_breakdown?.neutral||0}</td><td>{f.sentiment_breakdown?.negative||0}</td><td>{(f.recommendations||[]).join(', ')}</td></tr>)}</tbody></table>}
      </div>
    </div>
  );
}
