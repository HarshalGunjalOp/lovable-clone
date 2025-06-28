"use client"
import { useSuspenseQuery } from '@tanstack/react-query';
import { trpc } from '../trpc/server';
import { useTRPC } from '@/trpc/client';

export const Client = () => {

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.createAI.queryOptions({ text:  "Antonio server prefetch"}));


  return (
    <div className=''>
      {JSON.stringify(data)}
    </div>
  )
}