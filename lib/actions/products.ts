'use server';

import { supabase } from '@/lib/core/db/client';
import { revalidatePath } from 'next/cache';

export type ProductFields = {
  name: string;
  category: string;
  pack_size: string;
  order_type: string;
  price: number | null;
  currency: string;
};

export async function createProductAction(fields: ProductFields) {
  const { data, error } = await supabase
    .from('products')
    .insert({ ...fields, available: true })
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/dashboard/catalog');
  return data;
}

export async function updateProductAction(id: string, fields: ProductFields) {
  const { error } = await supabase.from('products').update(fields).eq('id', id);
  if (error) throw error;
  revalidatePath('/dashboard/catalog');
}

export async function deleteProductAction(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/dashboard/catalog');
}

export async function toggleAvailableAction(id: string, available: boolean) {
  const { error } = await supabase.from('products').update({ available }).eq('id', id);
  if (error) throw error;
  revalidatePath('/dashboard/catalog');
}
