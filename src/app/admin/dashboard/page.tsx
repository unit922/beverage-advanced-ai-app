"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage(){
  const [orders,setOrders]=useState<any[]>([]);
  const [feedbackHistory,setFeedbackHistory]=useState<any[]>([]);

  useEffect(()=>{ async function load(){
    const { data: ordersData } = await supabase.from('orders').select('id, created_at, total').order('created_at',{ascending:true});
    const { data: feedbackData } = await supabase.from('feedback_analysis').select('created_at, summary, sentiment_breakdown').order('created_at',{ascending:true});
    setOrders(ordersData||[]);
    setFeedbackHistory(feedbackData||[]);
  } load(); },[]);

  const salesData = orders.map(o=>({ date: new Date(o.created_at).toLocaleDateString(), total: o.total }));
  const sentimentTrend = feedbackHistory.map(f=>({ date: new Date(f.created_at).toLocaleDateString(), positive: f.sentiment_breakdown?.positive||0, neutral: f.sentiment_breakdown?.neutral||0, negative: f.sentiment_breakdown?.negative||0 }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-white shadow rounded-lg"><h3>Total Orders</h3><p className="text-2xl font-bold">{orders.length}</p></div>
        <div className="p-4 bg-white shadow rounded-lg"><h3>Feedback Entries</h3><p className="text-2xl font-bold">{feedbackHistory.length}</p></div>
      </div>

      <div className="p-6 bg-white shadow rounded-lg">
        <h3 className="font-bold">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={salesData}><CartesianGrid /><XAxis dataKey="date"/><YAxis/><Tooltip/><Legend/><Line dataKey="total" stroke="#3b82f6"/></LineChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 bg-white shadow rounded-lg">
        <h3 className="font-bold">Feedback Sentiment Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={sentimentTrend}><CartesianGrid /><XAxis dataKey="date"/><YAxis/><Tooltip/><Legend/><Line dataKey="positive" stroke="#22c55e"/><Line dataKey="neutral" stroke="#eab308"/><Line dataKey="negative" stroke="#ef4444"/></LineChart>
        </ResponsiveContainer>
      </div>

      <AIInsightsPanel />
    </div>
  );
}
