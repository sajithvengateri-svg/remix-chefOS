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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          section_id: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          section_id?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          section_id?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "kitchen_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          created_at: string
          id: string
          permission_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_type?: string
          user_id?: string
        }
        Relationships: []
      }
      allergens: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          location: string | null
          recurring: string | null
          status: string | null
          time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          location?: string | null
          recurring?: string | null
          status?: string | null
          time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          location?: string | null
          recurring?: string | null
          status?: string | null
          time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cheatsheets: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cleaning_areas: {
        Row: {
          cleaning_frequency: string | null
          created_at: string
          id: string
          instructions: string | null
          location: string | null
          name: string
          reference_image_url: string | null
          updated_at: string
        }
        Insert: {
          cleaning_frequency?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          location?: string | null
          name: string
          reference_image_url?: string | null
          updated_at?: string
        }
        Update: {
          cleaning_frequency?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          location?: string | null
          name?: string
          reference_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      demand_insights: {
        Row: {
          avg_price_paid: number | null
          created_at: string
          id: string
          ingredient_category: string
          order_count: number
          postcode: string
          total_quantity: number
          unit: string
          week_ending: string
        }
        Insert: {
          avg_price_paid?: number | null
          created_at?: string
          id?: string
          ingredient_category: string
          order_count?: number
          postcode: string
          total_quantity?: number
          unit?: string
          week_ending: string
        }
        Update: {
          avg_price_paid?: number | null
          created_at?: string
          id?: string
          ingredient_category?: string
          order_count?: number
          postcode?: string
          total_quantity?: number
          unit?: string
          week_ending?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          id: string
          last_maintenance: string | null
          location: string | null
          maintenance_schedule: string | null
          manual_url: string | null
          manufacturer: string | null
          model: string | null
          name: string
          next_maintenance: string | null
          notes: string | null
          purchase_date: string | null
          serial_number: string | null
          status: string | null
          tech_contacts: Json | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location?: string | null
          maintenance_schedule?: string | null
          manual_url?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          tech_contacts?: Json | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location?: string | null
          maintenance_schedule?: string | null
          manual_url?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_maintenance?: string | null
          notes?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string | null
          tech_contacts?: Json | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      food_safety_logs: {
        Row: {
          ai_verification_notes: string | null
          ai_verification_status: string | null
          corrective_action: string | null
          created_at: string
          date: string
          id: string
          location: string | null
          log_type: string
          notes: string | null
          readings: Json | null
          recorded_by: string | null
          recorded_by_name: string | null
          reference_image_url: string | null
          status: string | null
          time: string
          updated_at: string
          verification_image_url: string | null
        }
        Insert: {
          ai_verification_notes?: string | null
          ai_verification_status?: string | null
          corrective_action?: string | null
          created_at?: string
          date?: string
          id?: string
          location?: string | null
          log_type: string
          notes?: string | null
          readings?: Json | null
          recorded_by?: string | null
          recorded_by_name?: string | null
          reference_image_url?: string | null
          status?: string | null
          time?: string
          updated_at?: string
          verification_image_url?: string | null
        }
        Update: {
          ai_verification_notes?: string | null
          ai_verification_status?: string | null
          corrective_action?: string | null
          created_at?: string
          date?: string
          id?: string
          location?: string | null
          log_type?: string
          notes?: string | null
          readings?: Json | null
          recorded_by?: string | null
          recorded_by_name?: string | null
          reference_image_url?: string | null
          status?: string | null
          time?: string
          updated_at?: string
          verification_image_url?: string | null
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          allergens: string[] | null
          category: string
          cost_per_unit: number | null
          created_at: string
          current_stock: number | null
          id: string
          last_price_update: string | null
          name: string
          notes: string | null
          par_level: number | null
          previous_cost_per_unit: number | null
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          category?: string
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number | null
          id?: string
          last_price_update?: string | null
          name: string
          notes?: string | null
          par_level?: number | null
          previous_cost_per_unit?: number | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          category?: string
          cost_per_unit?: number | null
          created_at?: string
          current_stock?: number | null
          id?: string
          last_price_update?: string | null
          name?: string
          notes?: string | null
          par_level?: number | null
          previous_cost_per_unit?: number | null
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          batch_number: string | null
          created_at: string
          expiry_date: string | null
          id: string
          ingredient_id: string | null
          location: string | null
          min_stock: number | null
          name: string
          quantity: number
          received_date: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          ingredient_id?: string | null
          location?: string | null
          min_stock?: number | null
          name: string
          quantity?: number
          received_date?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          ingredient_id?: string | null
          location?: string | null
          min_stock?: number | null
          name?: string
          quantity?: number
          received_date?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      kitchen_sections: {
        Row: {
          color: string | null
          created_at: string
          current_month_cost: number | null
          description: string | null
          id: string
          is_active: boolean | null
          monthly_budget: number | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          current_month_cost?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_budget?: number | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          current_month_cost?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_budget?: number | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      kitchen_tasks: {
        Row: {
          actual_minutes: number | null
          approved_at: string | null
          approved_by: string | null
          assigned_by: string | null
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          due_time: string | null
          estimated_minutes: number | null
          id: string
          prep_list_id: string | null
          priority: string
          recipe_id: string | null
          rejection_reason: string | null
          section_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_minutes?: number | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          id?: string
          prep_list_id?: string | null
          priority?: string
          recipe_id?: string | null
          rejection_reason?: string | null
          section_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_minutes?: number | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          id?: string
          prep_list_id?: string | null
          priority?: string
          recipe_id?: string | null
          rejection_reason?: string | null
          section_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_tasks_prep_list_id_fkey"
            columns: ["prep_list_id"]
            isOneToOne: false
            referencedRelation: "prep_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_tasks_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_tasks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "kitchen_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category: string
          contribution_margin: number
          created_at: string
          description: string | null
          food_cost: number
          food_cost_percent: number
          id: string
          is_active: boolean
          menu_id: string
          name: string
          popularity: number
          profitability: string
          recipe_id: string | null
          sell_price: number
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          category?: string
          contribution_margin?: number
          created_at?: string
          description?: string | null
          food_cost?: number
          food_cost_percent?: number
          id?: string
          is_active?: boolean
          menu_id: string
          name: string
          popularity?: number
          profitability?: string
          recipe_id?: string | null
          sell_price?: number
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          category?: string
          contribution_margin?: number
          created_at?: string
          description?: string | null
          food_cost?: number
          food_cost_percent?: number
          id?: string
          is_active?: boolean
          menu_id?: string
          name?: string
          popularity?: number
          profitability?: string
          recipe_id?: string | null
          sell_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          avg_food_cost_percent: number | null
          created_at: string
          created_by: string | null
          effective_from: string
          effective_to: string | null
          id: string
          name: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          avg_food_cost_percent?: number | null
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          avg_food_cost_percent?: number | null
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      module_permissions: {
        Row: {
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prep_lists: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          created_at: string
          created_by: string | null
          date: string
          id: string
          items: Json | null
          name: string
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          items?: Json | null
          name: string
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          items?: Json | null
          name?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          position: string | null
          postcode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          position?: string | null
          postcode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          position?: string | null
          postcode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_ccps: {
        Row: {
          corrective_action: string | null
          created_at: string
          critical_limit_max: number | null
          critical_limit_min: number | null
          hazard_description: string | null
          hazard_type: string | null
          id: string
          is_critical: boolean | null
          monitoring_frequency: string | null
          monitoring_procedure: string | null
          recipe_id: string
          record_keeping_notes: string | null
          step_name: string
          step_order: number
          step_type: string
          target_temp: number | null
          temp_unit: string | null
          time_limit: number | null
          timeline_position: number | null
          updated_at: string
          verification_method: string | null
        }
        Insert: {
          corrective_action?: string | null
          created_at?: string
          critical_limit_max?: number | null
          critical_limit_min?: number | null
          hazard_description?: string | null
          hazard_type?: string | null
          id?: string
          is_critical?: boolean | null
          monitoring_frequency?: string | null
          monitoring_procedure?: string | null
          recipe_id: string
          record_keeping_notes?: string | null
          step_name: string
          step_order?: number
          step_type?: string
          target_temp?: number | null
          temp_unit?: string | null
          time_limit?: number | null
          timeline_position?: number | null
          updated_at?: string
          verification_method?: string | null
        }
        Update: {
          corrective_action?: string | null
          created_at?: string
          critical_limit_max?: number | null
          critical_limit_min?: number | null
          hazard_description?: string | null
          hazard_type?: string | null
          id?: string
          is_critical?: boolean | null
          monitoring_frequency?: string | null
          monitoring_procedure?: string | null
          recipe_id?: string
          record_keeping_notes?: string | null
          step_name?: string
          step_order?: number
          step_type?: string
          target_temp?: number | null
          temp_unit?: string | null
          time_limit?: number | null
          timeline_position?: number | null
          updated_at?: string
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ccps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          notes: string | null
          quantity: number
          recipe_id: string
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          notes?: string | null
          quantity?: number
          recipe_id: string
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          notes?: string | null
          quantity?: number
          recipe_id?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_sections: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          allergens: string[] | null
          batch_yield_quantity: number | null
          batch_yield_unit: string | null
          category: string
          cook_time: number | null
          cost_per_serving: number | null
          created_at: string
          created_by: string | null
          description: string | null
          food_cost_high_alert: number | null
          food_cost_low_alert: number | null
          gst_percent: number | null
          id: string
          image_url: string | null
          ingredients: Json | null
          instructions: Json | null
          is_batch_recipe: boolean | null
          is_public: boolean | null
          name: string
          prep_time: number | null
          sell_price: number | null
          servings: number | null
          target_food_cost_percent: number | null
          tasting_notes: string | null
          total_yield: number | null
          updated_at: string
          yield_unit: string | null
        }
        Insert: {
          allergens?: string[] | null
          batch_yield_quantity?: number | null
          batch_yield_unit?: string | null
          category?: string
          cook_time?: number | null
          cost_per_serving?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          food_cost_high_alert?: number | null
          food_cost_low_alert?: number | null
          gst_percent?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          is_batch_recipe?: boolean | null
          is_public?: boolean | null
          name: string
          prep_time?: number | null
          sell_price?: number | null
          servings?: number | null
          target_food_cost_percent?: number | null
          tasting_notes?: string | null
          total_yield?: number | null
          updated_at?: string
          yield_unit?: string | null
        }
        Update: {
          allergens?: string[] | null
          batch_yield_quantity?: number | null
          batch_yield_unit?: string | null
          category?: string
          cook_time?: number | null
          cost_per_serving?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          food_cost_high_alert?: number | null
          food_cost_low_alert?: number | null
          gst_percent?: number | null
          id?: string
          image_url?: string | null
          ingredients?: Json | null
          instructions?: Json | null
          is_batch_recipe?: boolean | null
          is_public?: boolean | null
          name?: string
          prep_time?: number | null
          sell_price?: number | null
          servings?: number | null
          target_food_cost_percent?: number | null
          tasting_notes?: string | null
          total_yield?: number | null
          updated_at?: string
          yield_unit?: string | null
        }
        Relationships: []
      }
      roster_shifts: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          end_time: string
          id: string
          notes: string | null
          position: string | null
          start_time: string
          updated_at: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          end_time: string
          id?: string
          notes?: string | null
          position?: string | null
          start_time: string
          updated_at?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          position?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      section_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string
          id: string
          role: string
          section_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: string
          section_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: string
          section_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "kitchen_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string | null
          inventory_id: string | null
          movement_type: string
          notes: string | null
          quantity_after: number | null
          quantity_before: number | null
          quantity_change: number
          recorded_by: string | null
          recorded_by_name: string | null
          source: string | null
          source_reference: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          inventory_id?: string | null
          movement_type: string
          notes?: string | null
          quantity_after?: number | null
          quantity_before?: number | null
          quantity_change: number
          recorded_by?: string | null
          recorded_by_name?: string | null
          source?: string | null
          source_reference?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string | null
          inventory_id?: string | null
          movement_type?: string
          notes?: string | null
          quantity_after?: number | null
          quantity_before?: number | null
          quantity_change?: number
          recorded_by?: string | null
          recorded_by_name?: string | null
          source?: string | null
          source_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      stocktake_items: {
        Row: {
          counted_at: string | null
          counted_by: string | null
          counted_quantity: number | null
          created_at: string
          expected_quantity: number
          id: string
          ingredient_id: string | null
          ingredient_name: string
          inventory_id: string | null
          location: string | null
          notes: string | null
          stocktake_id: string
          unit: string
          variance: number | null
          variance_value: number | null
        }
        Insert: {
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string
          expected_quantity?: number
          id?: string
          ingredient_id?: string | null
          ingredient_name: string
          inventory_id?: string | null
          location?: string | null
          notes?: string | null
          stocktake_id: string
          unit?: string
          variance?: number | null
          variance_value?: number | null
        }
        Update: {
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string
          expected_quantity?: number
          id?: string
          ingredient_id?: string | null
          ingredient_name?: string
          inventory_id?: string | null
          location?: string | null
          notes?: string | null
          stocktake_id?: string
          unit?: string
          variance?: number | null
          variance_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stocktake_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocktake_items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocktake_items_stocktake_id_fkey"
            columns: ["stocktake_id"]
            isOneToOne: false
            referencedRelation: "stocktakes"
            referencedColumns: ["id"]
          },
        ]
      }
      stocktakes: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          items_counted: number | null
          name: string
          notes: string | null
          status: string
          stocktake_date: string
          stocktake_type: string
          total_items: number | null
          total_variance_value: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          items_counted?: number | null
          name: string
          notes?: string | null
          status?: string
          stocktake_date?: string
          stocktake_type?: string
          total_items?: number | null
          total_variance_value?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          items_counted?: number | null
          name?: string
          notes?: string | null
          status?: string
          stocktake_date?: string
          stocktake_type?: string
          total_items?: number | null
          total_variance_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          account_number: string | null
          category: string
          created_at: string
          credit_status: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          products: string | null
          rep_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          account_number?: string | null
          category?: string
          created_at?: string
          credit_status?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          products?: string | null
          rep_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          account_number?: string | null
          category?: string
          created_at?: string
          credit_status?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          products?: string | null
          rep_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_system_message: boolean | null
          task_id: string
          updated_at: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          task_id: string
          updated_at?: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_system_message?: boolean | null
          task_id?: string
          updated_at?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "kitchen_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: []
      }
      training_materials: {
        Row: {
          category: string
          content: string | null
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          file_url: string | null
          id: string
          required_for: string[] | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          file_url?: string | null
          id?: string
          required_for?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          file_url?: string | null
          id?: string
          required_for?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      training_records: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          material_id: string
          notes: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          material_id: string
          notes?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          material_id?: string
          notes?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_records_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "training_materials"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      vendor_deals: {
        Row: {
          applicable_categories: string[] | null
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          end_date: string
          id: string
          is_active: boolean | null
          min_order_value: number | null
          start_date: string
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          applicable_categories?: string[] | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          end_date: string
          id?: string
          is_active?: boolean | null
          min_order_value?: number | null
          start_date?: string
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          applicable_categories?: string[] | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          min_order_value?: number | null
          start_date?: string
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_deals_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_messages: {
        Row: {
          chef_user_id: string
          created_at: string
          id: string
          message: string
          order_id: string | null
          read_at: string | null
          sender_id: string
          sender_type: string
          vendor_id: string
        }
        Insert: {
          chef_user_id: string
          created_at?: string
          id?: string
          message: string
          order_id?: string | null
          read_at?: string | null
          sender_id: string
          sender_type: string
          vendor_id: string
        }
        Update: {
          chef_user_id?: string
          created_at?: string
          id?: string
          message?: string
          order_id?: string | null
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "vendor_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_messages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_orders: {
        Row: {
          chef_user_id: string
          created_at: string
          delivery_address: string | null
          delivery_date: string | null
          delivery_fee: number | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          status: string | null
          subtotal: number
          total: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          chef_user_id: string
          created_at?: string
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_fee?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          chef_user_id?: string
          created_at?: string
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_fee?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_pricing: {
        Row: {
          category: string | null
          created_at: string
          id: string
          ingredient_name: string
          is_available: boolean | null
          lead_time_days: number | null
          max_order_quantity: number | null
          min_order_quantity: number | null
          notes: string | null
          price_per_unit: number
          unit: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          vendor_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          ingredient_name: string
          is_available?: boolean | null
          lead_time_days?: number | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          notes?: string | null
          price_per_unit: number
          unit?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          vendor_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          ingredient_name?: string
          is_available?: boolean | null
          lead_time_days?: number | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          notes?: string | null
          price_per_unit?: number
          unit?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_pricing_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          abn: string | null
          address: string | null
          business_name: string
          categories: string[] | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          delivery_areas: string[] | null
          id: string
          logo_url: string | null
          postcode: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abn?: string | null
          address?: string | null
          business_name: string
          categories?: string[] | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          delivery_areas?: string[] | null
          id?: string
          logo_url?: string | null
          postcode?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abn?: string | null
          address?: string | null
          business_name?: string
          categories?: string[] | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          delivery_areas?: string[] | null
          id?: string
          logo_url?: string | null
          postcode?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["vendor_role"]
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["vendor_role"]
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["vendor_role"]
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_roles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_invite_by_token: {
        Args: { _token: string }
        Returns: {
          accepted_at: string
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_sections: {
        Args: { _user_id: string }
        Returns: {
          role: string
          section_id: string
        }[]
      }
      get_vendor_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_head_chef: { Args: { _user_id: string }; Returns: boolean }
      is_section_leader: {
        Args: { _section_id: string; _user_id: string }
        Returns: boolean
      }
      is_vendor: { Args: { _user_id: string }; Returns: boolean }
      sync_inventory_from_ingredients: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "head_chef" | "line_chef" | "admin"
      vendor_role: "vendor_admin" | "vendor_staff"
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
      app_role: ["head_chef", "line_chef", "admin"],
      vendor_role: ["vendor_admin", "vendor_staff"],
    },
  },
} as const
