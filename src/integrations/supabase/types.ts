export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_claims: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          item_type: string
          metadata: Json
          price_cop: number
          product_id: string | null
          quantity: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_type?: string
          metadata?: Json
          price_cop?: number
          product_id?: string | null
          quantity?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_type?: string
          metadata?: Json
          price_cop?: number
          product_id?: string | null
          quantity?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_type: string
          status: string
          title: string
          total_cop: number
          tracking_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_type?: string
          status?: string
          title: string
          total_cop?: number
          tracking_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_type?: string
          status?: string
          title?: string
          total_cop?: number
          tracking_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      directory_recommendations: {
        Row: {
          business_name: string
          category: string
          created_at: string
          description: string
          id: string
          is_coming_soon: boolean
          logo_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          business_name: string
          category: string
          created_at?: string
          description?: string
          id?: string
          is_coming_soon?: boolean
          logo_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          business_name?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_coming_soon?: boolean
          logo_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_link: string | null
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      physical_products: {
        Row: {
          created_at: string
          description: string
          id: string
          images: string[]
          is_active: boolean
          is_coming_soon: boolean
          name: string
          price_cop: number
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          is_active?: boolean
          is_coming_soon?: boolean
          name: string
          price_cop?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          is_active?: boolean
          is_coming_soon?: boolean
          name?: string
          price_cop?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      promo_popups: {
        Row: {
          activo: boolean
          codigo: string | null
          created_at: string
          cta_text: string | null
          cta_url: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          frecuencia: string
          id: string
          imagen_url: string | null
          mensaje: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          codigo?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          frecuencia?: string
          id?: string
          imagen_url?: string | null
          mensaje?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          codigo?: string | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          frecuencia?: string
          id?: string
          imagen_url?: string | null
          mensaje?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      sold_projects: {
        Row: {
          base_datos: string | null
          cliente: string
          correo_bd: string | null
          correo_dominio: string | null
          correo_hosting: string | null
          correo_ia: string | null
          cotizacion_cop: number | null
          created_at: string
          dominio: string | null
          estado_pagina: string | null
          estado_proyecto: string | null
          fecha_renovacion_dominio: string | null
          fecha_renovacion_hosting: string | null
          ia_usada: string | null
          id: string
          notas: string | null
          numero: number | null
          proveedor_dominio: string | null
          proveedor_hosting: string | null
          telefono_hosting: string | null
          tipo_pagina: string | null
          updated_at: string
        }
        Insert: {
          base_datos?: string | null
          cliente: string
          correo_bd?: string | null
          correo_dominio?: string | null
          correo_hosting?: string | null
          correo_ia?: string | null
          cotizacion_cop?: number | null
          created_at?: string
          dominio?: string | null
          estado_pagina?: string | null
          estado_proyecto?: string | null
          fecha_renovacion_dominio?: string | null
          fecha_renovacion_hosting?: string | null
          ia_usada?: string | null
          id?: string
          notas?: string | null
          numero?: number | null
          proveedor_dominio?: string | null
          proveedor_hosting?: string | null
          telefono_hosting?: string | null
          tipo_pagina?: string | null
          updated_at?: string
        }
        Update: {
          base_datos?: string | null
          cliente?: string
          correo_bd?: string | null
          correo_dominio?: string | null
          correo_hosting?: string | null
          correo_ia?: string | null
          cotizacion_cop?: number | null
          created_at?: string
          dominio?: string | null
          estado_pagina?: string | null
          estado_proyecto?: string | null
          fecha_renovacion_dominio?: string | null
          fecha_renovacion_hosting?: string | null
          ia_usada?: string | null
          id?: string
          notas?: string | null
          numero?: number | null
          proveedor_dominio?: string | null
          proveedor_hosting?: string | null
          telefono_hosting?: string | null
          tipo_pagina?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sponsor_gallery: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          link_url: string | null
          orden: number
          titulo: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          link_url?: string | null
          orden?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          link_url?: string | null
          orden?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          topic: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          topic?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trusted_brands: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string
          name: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url: string
          name: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string
          name?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      web_project_orders: {
        Row: {
          admin_notes: string | null
          business_name: string
          created_at: string
          description: string
          domain: string | null
          id: string
          owner_contact: string
          price_cop: number
          project_type: string
          renewal_date: string | null
          source: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_name: string
          created_at?: string
          description?: string
          domain?: string | null
          id?: string
          owner_contact: string
          price_cop?: number
          project_type: string
          renewal_date?: string | null
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_name?: string
          created_at?: string
          description?: string
          domain?: string | null
          id?: string
          owner_contact?: string
          price_cop?: number
          project_type?: string
          renewal_date?: string | null
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_header_password_ok: { Args: never; Returns: boolean }
      admin_password_ok: { Args: { _password: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_admin_code: { Args: { _code: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
