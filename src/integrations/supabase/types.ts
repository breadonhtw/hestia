export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      artisan_applications: {
        Row: {
          craft_type: string;
          created_at: string | null;
          email: string;
          id: string;
          instagram: string | null;
          location: string;
          name: string;
          phone: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          specialty: string | null;
          status: string | null;
          story: string;
          website: string | null;
        };
        Insert: {
          craft_type: string;
          created_at?: string | null;
          email: string;
          id?: string;
          instagram?: string | null;
          location: string;
          name: string;
          phone?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          specialty?: string | null;
          status?: string | null;
          story: string;
          website?: string | null;
        };
        Update: {
          craft_type?: string;
          created_at?: string | null;
          email?: string;
          id?: string;
          instagram?: string | null;
          location?: string;
          name?: string;
          phone?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          specialty?: string | null;
          status?: string | null;
          story?: string;
          website?: string | null;
        };
        Relationships: [];
      };
      artisans: {
        Row: {
          accepting_orders: boolean | null;
          bio: string;
          craft_type: string;
          created_at: string;
          featured: boolean;
          id: string;
          instagram: string | null;
          location: string;
          open_for_commissions: boolean | null;
          profile_completed: boolean;
          story: string | null;
          updated_at: string;
          user_id: string;
          website: string | null;
          status: string;
          published_at: string | null;
          // New MVP fields
          categories: string[];
          tags: string[] | null;
          estate: string | null;
          contact_channel: Database["public"]["Enums"]["contact_channel_type"];
          contact_value: string | null;
          email: string | null;
          phone: string | null;
          accepting_orders_expires_at: string | null;
          // Pricing fields
          pricing_model:
            | Database["public"]["Enums"]["pricing_model_type"]
            | null;
          price_min: number | null;
          price_max: number | null;
          currency: string | null;
          // Additional contact fields
          whatsapp_url: string | null;
          external_shop_url: string | null;
          telegram: string | null;
          lead_time_days: number | null;
          hours: Json | null;
        };
        Insert: {
          accepting_orders?: boolean | null;
          bio?: string;
          craft_type?: string;
          created_at?: string;
          featured?: boolean;
          id?: string;
          instagram?: string | null;
          location?: string;
          open_for_commissions?: boolean | null;
          profile_completed?: boolean;
          story?: string | null;
          updated_at?: string;
          user_id: string;
          website?: string | null;
          status?: string;
          published_at?: string | null;
          // New MVP fields
          categories?: string[];
          tags?: string[] | null;
          estate?: string | null;
          contact_channel?: Database["public"]["Enums"]["contact_channel_type"];
          contact_value?: string | null;
          email?: string | null;
          phone?: string | null;
          accepting_orders_expires_at?: string | null;
          // Pricing fields
          pricing_model?:
            | Database["public"]["Enums"]["pricing_model_type"]
            | null;
          price_min?: number | null;
          price_max?: number | null;
          currency?: string | null;
          // Additional contact fields
          whatsapp_url?: string | null;
          external_shop_url?: string | null;
          telegram?: string | null;
          lead_time_days?: number | null;
          hours?: Json | null;
        };
        Update: {
          accepting_orders?: boolean | null;
          bio?: string;
          craft_type?: string;
          created_at?: string;
          featured?: boolean;
          id?: string;
          instagram?: string | null;
          location?: string;
          open_for_commissions?: boolean | null;
          profile_completed?: boolean;
          story?: string | null;
          updated_at?: string;
          user_id?: string;
          website?: string | null;
          status?: string;
          published_at?: string | null;
          // New MVP fields
          categories?: string[];
          tags?: string[] | null;
          estate?: string | null;
          contact_channel?: Database["public"]["Enums"]["contact_channel_type"];
          contact_value?: string | null;
          email?: string | null;
          phone?: string | null;
          accepting_orders_expires_at?: string | null;
          // Pricing fields
          pricing_model?:
            | Database["public"]["Enums"]["pricing_model_type"]
            | null;
          price_min?: number | null;
          price_max?: number | null;
          currency?: string | null;
          // Additional contact fields
          whatsapp_url?: string | null;
          external_shop_url?: string | null;
          telegram?: string | null;
          lead_time_days?: number | null;
          hours?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "artisans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      contact_requests: {
        Row: {
          artisan_id: string;
          created_at: string;
          id: string;
          message: string;
          sender_email: string;
          sender_name: string;
          status: string | null;
        };
        Insert: {
          artisan_id: string;
          created_at?: string;
          id?: string;
          message: string;
          sender_email: string;
          sender_name: string;
          status?: string | null;
        };
        Update: {
          artisan_id?: string;
          created_at?: string;
          id?: string;
          message?: string;
          sender_email?: string;
          sender_name?: string;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contact_requests_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contact_requests_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisans_public";
            referencedColumns: ["id"];
          }
        ];
      };
      craft_types: {
        Row: {
          created_at: string;
          icon: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          icon: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          icon?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          artisan_id: string;
          created_at: string;
          description: string | null;
          display_order: number;
          id: string;
          image_url: string;
          title: string;
          is_featured: boolean;
        };
        Insert: {
          artisan_id: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          image_url: string;
          title: string;
          is_featured?: boolean;
        };
        Update: {
          artisan_id?: string;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          id?: string;
          image_url?: string;
          title?: string;
          is_featured?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_images_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gallery_images_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisans_public";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name: string;
          id: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      user_favorites: {
        Row: {
          artisan_id: string;
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          artisan_id: string;
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          artisan_id?: string;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_favorites_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_favorites_artisan_id_fkey";
            columns: ["artisan_id"];
            isOneToOne: false;
            referencedRelation: "artisans_public";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      artisans_public: {
        Row: {
          accepting_orders: boolean | null;
          avatar_url: string | null;
          bio: string | null;
          craft_type: string | null;
          created_at: string | null;
          featured: boolean | null;
          full_name: string | null;
          id: string | null;
          instagram: string | null;
          location: string | null;
          open_for_commissions: boolean | null;
          story: string | null;
          updated_at: string | null;
          published_at: string | null;
          user_id: string | null;
          username: string | null;
          website: string | null;
          // New MVP fields
          categories: string[] | null;
          tags: string[] | null;
          estate: string | null;
          contact_channel:
            | Database["public"]["Enums"]["contact_channel_type"]
            | null;
          contact_value: string | null;
          email: string | null;
          phone: string | null;
          accepting_orders_expires_at: string | null;
          // Pricing fields
          pricing_model:
            | Database["public"]["Enums"]["pricing_model_type"]
            | null;
          price_min: number | null;
          price_max: number | null;
          currency: string | null;
          // Additional contact fields
          whatsapp_url: string | null;
          external_shop_url: string | null;
          telegram: string | null;
          lead_time_days: number | null;
          hours: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "artisans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      get_email_by_username: {
        Args: { _username: string };
        Returns: string;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_artisan_profile_completed: {
        Args: { _artisan_id: string };
        Returns: boolean;
      };
      create_artisan_profile: {
        Args: { _user_id: string };
        Returns: string;
      };
      publish_artisan_profile: {
        Args: { _user_id: string };
        Returns: Json;
      };
      unpublish_artisan_profile: {
        Args: { _user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "artisan" | "community_member" | "admin";
      contact_channel_type:
        | "chat"
        | "instagram"
        | "website"
        | "email"
        | "phone";
      pricing_model_type: "fixed" | "range" | "contact";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["artisan", "community_member", "admin"],
    },
  },
} as const;
