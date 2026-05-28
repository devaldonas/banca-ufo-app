import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isUserAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao verificar admin:', error);
      return false;
    }
    
    return data?.role === 'admin';
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return false;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) return null;
    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

export const getAllJornaleiros = async () => {
  const { data, error } = await supabase
    .from('jornaleiros')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateJornaleiroStatus = async (id: number, status: string) => {
  const { data, error } = await supabase
    .from('jornaleiros')
    .update({ status })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
};