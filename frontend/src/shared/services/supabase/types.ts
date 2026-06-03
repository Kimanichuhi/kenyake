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
      accommodation_bookings: {
        Row: {
          accommodation_id: string
          check_in: string
          check_out: string
          contact_phone: string | null
          created_at: string
          guest_count: number | null
          id: string
          rooms: number | null
          special_requests: string | null
          status: string | null
          total_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation_id: string
          check_in: string
          check_out: string
          contact_phone?: string | null
          created_at?: string
          guest_count?: number | null
          id?: string
          rooms?: number | null
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation_id?: string
          check_in?: string
          check_out?: string
          contact_phone?: string | null
          created_at?: string
          guest_count?: number | null
          id?: string
          rooms?: number | null
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_bookings_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodations: {
        Row: {
          accessibility_features: string[] | null
          amenities: string[] | null
          cancellation_policy: string | null
          check_in_time: string | null
          check_out_time: string | null
          community_id: string | null
          contact_email: string | null
          contact_phone: string | null
          county: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          gallery_images: string[] | null
          group_capacity: number | null
          has_generator: boolean | null
          has_hot_water: boolean | null
          has_solar: boolean | null
          id: string
          impact_score: number | null
          is_community_owned: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          lat: number | null
          lng: number | null
          local_employment_count: number | null
          local_procurement_percent: number | null
          location_name: string | null
          max_guests: number | null
          name: string
          nearby_activities: string[] | null
          owner_name: string | null
          price_currency: string | null
          price_display: string | null
          price_per_night: number
          property_type: string
          rating: number | null
          review_count: number | null
          rooms_available: number | null
          short_description: string | null
          slug: string
          tier: string
          updated_at: string
          wifi_speed_mbps: number | null
        }
        Insert: {
          accessibility_features?: string[] | null
          amenities?: string[] | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          community_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          gallery_images?: string[] | null
          group_capacity?: number | null
          has_generator?: boolean | null
          has_hot_water?: boolean | null
          has_solar?: boolean | null
          id?: string
          impact_score?: number | null
          is_community_owned?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          local_employment_count?: number | null
          local_procurement_percent?: number | null
          location_name?: string | null
          max_guests?: number | null
          name: string
          nearby_activities?: string[] | null
          owner_name?: string | null
          price_currency?: string | null
          price_display?: string | null
          price_per_night?: number
          property_type?: string
          rating?: number | null
          review_count?: number | null
          rooms_available?: number | null
          short_description?: string | null
          slug: string
          tier?: string
          updated_at?: string
          wifi_speed_mbps?: number | null
        }
        Update: {
          accessibility_features?: string[] | null
          amenities?: string[] | null
          cancellation_policy?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          community_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          gallery_images?: string[] | null
          group_capacity?: number | null
          has_generator?: boolean | null
          has_hot_water?: boolean | null
          has_solar?: boolean | null
          id?: string
          impact_score?: number | null
          is_community_owned?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          local_employment_count?: number | null
          local_procurement_percent?: number | null
          location_name?: string | null
          max_guests?: number | null
          name?: string
          nearby_activities?: string[] | null
          owner_name?: string | null
          price_currency?: string | null
          price_display?: string | null
          price_per_night?: number
          property_type?: string
          rating?: number | null
          review_count?: number | null
          rooms_available?: number | null
          short_description?: string | null
          slug?: string
          tier?: string
          updated_at?: string
          wifi_speed_mbps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      ancestral_visit_requests: {
        Row: {
          community_id: string | null
          created_at: string
          family_name: string | null
          group_size: number | null
          id: string
          preferred_dates: string | null
          purpose: string | null
          region_of_origin: string | null
          special_requests: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          family_name?: string | null
          group_size?: number | null
          id?: string
          preferred_dates?: string | null
          purpose?: string | null
          region_of_origin?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          family_name?: string | null
          group_size?: number | null
          id?: string
          preferred_dates?: string | null
          purpose?: string | null
          region_of_origin?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ancestral_visit_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_packages: {
        Row: {
          budget_tier: string
          county: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          description_sw: string | null
          destination: string
          duration_days: number | null
          group_size_max: number | null
          group_size_min: number | null
          id: string
          includes: string[] | null
          is_featured: boolean | null
          is_published: boolean | null
          itinerary: Json | null
          meals_included: boolean | null
          price_kes: number
          price_usd: number | null
          rating: number | null
          review_count: number | null
          slug: string
          suitable_for: string[] | null
          title: string
          title_sw: string | null
          transport_included: boolean | null
          updated_at: string
        }
        Insert: {
          budget_tier?: string
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          description_sw?: string | null
          destination: string
          duration_days?: number | null
          group_size_max?: number | null
          group_size_min?: number | null
          id?: string
          includes?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          itinerary?: Json | null
          meals_included?: boolean | null
          price_kes?: number
          price_usd?: number | null
          rating?: number | null
          review_count?: number | null
          slug: string
          suitable_for?: string[] | null
          title: string
          title_sw?: string | null
          transport_included?: boolean | null
          updated_at?: string
        }
        Update: {
          budget_tier?: string
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          description_sw?: string | null
          destination?: string
          duration_days?: number | null
          group_size_max?: number | null
          group_size_min?: number | null
          id?: string
          includes?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          itinerary?: Json | null
          meals_included?: boolean | null
          price_kes?: number
          price_usd?: number | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          suitable_for?: string[] | null
          title?: string
          title_sw?: string | null
          transport_included?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      carbon_offset_projects: {
        Row: {
          county: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          is_verified: boolean | null
          location_name: string | null
          partner_name: string | null
          price_per_ton_kes: number | null
          project_type: string
          slug: string
          title: string
          tons_available: number | null
          tons_offset_total: number | null
          updated_at: string
        }
        Insert: {
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          location_name?: string | null
          partner_name?: string | null
          price_per_ton_kes?: number | null
          project_type?: string
          slug: string
          title: string
          tons_available?: number | null
          tons_offset_total?: number | null
          updated_at?: string
        }
        Update: {
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          location_name?: string | null
          partner_name?: string | null
          price_per_ton_kes?: number | null
          project_type?: string
          slug?: string
          title?: string
          tons_available?: number | null
          tons_offset_total?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_room_members: {
        Row: {
          display_name: string | null
          id: string
          joined_at: string
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          display_name?: string | null
          id?: string
          joined_at?: string
          role?: string
          room_id: string
          user_id: string
        }
        Update: {
          display_name?: string | null
          id?: string
          joined_at?: string
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_room_messages: {
        Row: {
          content: string
          created_at: string
          display_name: string | null
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          display_name?: string | null
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          display_name?: string | null
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string
          is_private: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code: string
          is_private?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string
          is_private?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          adornment_explanation: string | null
          contact_email: string | null
          contact_phone: string | null
          county: string
          created_at: string
          current_visitor_count: number | null
          description: string | null
          ecological_knowledge: string | null
          established_year: string | null
          hero_image: string | null
          history: string | null
          id: string
          is_published: boolean | null
          lat: number | null
          leader_name: string | null
          leader_title: string | null
          lng: number | null
          managed_by: string | null
          max_daily_visitors: number | null
          name: string
          origin_story: string | null
          population: number | null
          region: string | null
          slug: string
          specialty: string | null
          traditional_dress: string | null
          updated_at: string
          visitor_guidelines: string | null
        }
        Insert: {
          adornment_explanation?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          county: string
          created_at?: string
          current_visitor_count?: number | null
          description?: string | null
          ecological_knowledge?: string | null
          established_year?: string | null
          hero_image?: string | null
          history?: string | null
          id?: string
          is_published?: boolean | null
          lat?: number | null
          leader_name?: string | null
          leader_title?: string | null
          lng?: number | null
          managed_by?: string | null
          max_daily_visitors?: number | null
          name: string
          origin_story?: string | null
          population?: number | null
          region?: string | null
          slug: string
          specialty?: string | null
          traditional_dress?: string | null
          updated_at?: string
          visitor_guidelines?: string | null
        }
        Update: {
          adornment_explanation?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string
          created_at?: string
          current_visitor_count?: number | null
          description?: string | null
          ecological_knowledge?: string | null
          established_year?: string | null
          hero_image?: string | null
          history?: string | null
          id?: string
          is_published?: boolean | null
          lat?: number | null
          leader_name?: string | null
          leader_title?: string | null
          lng?: number | null
          managed_by?: string | null
          max_daily_visitors?: number | null
          name?: string
          origin_story?: string | null
          population?: number | null
          region?: string | null
          slug?: string
          specialty?: string | null
          traditional_dress?: string | null
          updated_at?: string
          visitor_guidelines?: string | null
        }
        Relationships: []
      }
      community_content: {
        Row: {
          body: string | null
          community_id: string
          content_type: string
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          metadata: Json | null
          sort_order: number | null
          title: string
        }
        Insert: {
          body?: string | null
          community_id: string
          content_type: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          metadata?: Json | null
          sort_order?: number | null
          title: string
        }
        Update: {
          body?: string | null
          community_id?: string
          content_type?: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          metadata?: Json | null
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_content_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_elders: {
        Row: {
          availability: string | null
          bio: string | null
          community_id: string
          created_at: string
          expertise: string[] | null
          id: string
          is_published: boolean | null
          languages: string[] | null
          name: string
          photo_url: string | null
          title: string | null
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          community_id: string
          created_at?: string
          expertise?: string[] | null
          id?: string
          is_published?: boolean | null
          languages?: string[] | null
          name: string
          photo_url?: string | null
          title?: string | null
        }
        Update: {
          availability?: string | null
          bio?: string | null
          community_id?: string
          created_at?: string
          expertise?: string[] | null
          id?: string
          is_published?: boolean | null
          languages?: string[] | null
          name?: string
          photo_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_elders_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_events: {
        Row: {
          community_id: string
          county: string | null
          cover_image: string | null
          created_at: string
          created_by: string | null
          current_attendees: number | null
          description: string | null
          end_date: string | null
          end_time: string | null
          etiquette_notes: string | null
          event_type: string
          id: string
          invitation_required: boolean | null
          is_past: boolean | null
          is_published: boolean | null
          lat: number | null
          lng: number | null
          location_name: string | null
          max_attendees: number | null
          preparation_guide: string | null
          price: string | null
          recurrence: string | null
          recurrence_detail: string | null
          slug: string
          start_date: string
          start_time: string | null
          title: string
          updated_at: string
          what_to_bring: string | null
          what_to_wear: string | null
        }
        Insert: {
          community_id: string
          county?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          etiquette_notes?: string | null
          event_type?: string
          id?: string
          invitation_required?: boolean | null
          is_past?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_attendees?: number | null
          preparation_guide?: string | null
          price?: string | null
          recurrence?: string | null
          recurrence_detail?: string | null
          slug: string
          start_date: string
          start_time?: string | null
          title: string
          updated_at?: string
          what_to_bring?: string | null
          what_to_wear?: string | null
        }
        Update: {
          community_id?: string
          county?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          etiquette_notes?: string | null
          event_type?: string
          id?: string
          invitation_required?: boolean | null
          is_past?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_attendees?: number | null
          preparation_guide?: string | null
          price?: string | null
          recurrence?: string | null
          recurrence_detail?: string | null
          slug?: string
          start_date?: string
          start_time?: string | null
          title?: string
          updated_at?: string
          what_to_bring?: string | null
          what_to_wear?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_gallery: {
        Row: {
          caption: string | null
          community_id: string
          created_at: string
          id: string
          is_approved: boolean | null
          media_type: string
          media_url: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          community_id: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          media_type?: string
          media_url: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          community_id?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          media_type?: string
          media_url?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_gallery_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_impact_reports: {
        Row: {
          community_id: string | null
          conservation_fund_kes: number | null
          created_at: string
          education_fund_kes: number | null
          hectares_conserved: number | null
          id: string
          infrastructure_fund_kes: number | null
          is_published: boolean | null
          local_employment_count: number | null
          local_procurement_percent: number | null
          schools_supported: number | null
          summary: string | null
          total_revenue_kes: number | null
          total_visitors: number | null
          trees_planted: number | null
          year: number
        }
        Insert: {
          community_id?: string | null
          conservation_fund_kes?: number | null
          created_at?: string
          education_fund_kes?: number | null
          hectares_conserved?: number | null
          id?: string
          infrastructure_fund_kes?: number | null
          is_published?: boolean | null
          local_employment_count?: number | null
          local_procurement_percent?: number | null
          schools_supported?: number | null
          summary?: string | null
          total_revenue_kes?: number | null
          total_visitors?: number | null
          trees_planted?: number | null
          year: number
        }
        Update: {
          community_id?: string | null
          conservation_fund_kes?: number | null
          created_at?: string
          education_fund_kes?: number | null
          hectares_conserved?: number | null
          id?: string
          infrastructure_fund_kes?: number | null
          is_published?: boolean | null
          local_employment_count?: number | null
          local_procurement_percent?: number | null
          schools_supported?: number | null
          summary?: string | null
          total_revenue_kes?: number | null
          total_visitors?: number | null
          trees_planted?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_impact_reports_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_review_responses: {
        Row: {
          community_id: string
          created_at: string
          id: string
          responded_at: string | null
          responded_by: string | null
          response_text: string | null
          review_date: string | null
          review_rating: number | null
          review_text: string
          reviewer_name: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          response_text?: string | null
          review_date?: string | null
          review_rating?: number | null
          review_text: string
          reviewer_name: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          responded_at?: string | null
          responded_by?: string | null
          response_text?: string | null
          review_date?: string | null
          review_rating?: number | null
          review_text?: string
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_review_responses_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      coworking_spaces: {
        Row: {
          address: string | null
          amenities: string[] | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          county: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          gallery_images: string[] | null
          has_24hr_access: boolean | null
          has_generator: boolean | null
          id: string
          internet_backup: boolean | null
          internet_speed_mbps: number | null
          is_published: boolean | null
          is_verified: boolean | null
          lat: number | null
          lng: number | null
          name: string
          opening_hours: string | null
          price_currency: string | null
          price_per_day: number | null
          price_per_month: number | null
          price_per_week: number | null
          rating: number | null
          review_count: number | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          gallery_images?: string[] | null
          has_24hr_access?: boolean | null
          has_generator?: boolean | null
          id?: string
          internet_backup?: boolean | null
          internet_speed_mbps?: number | null
          is_published?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          opening_hours?: string | null
          price_currency?: string | null
          price_per_day?: number | null
          price_per_month?: number | null
          price_per_week?: number | null
          rating?: number | null
          review_count?: number | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          gallery_images?: string[] | null
          has_24hr_access?: boolean | null
          has_generator?: boolean | null
          id?: string
          internet_backup?: boolean | null
          internet_speed_mbps?: number | null
          is_published?: boolean | null
          is_verified?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          opening_hours?: string | null
          price_currency?: string | null
          price_per_day?: number | null
          price_per_month?: number | null
          price_per_week?: number | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      cultural_programmes: {
        Row: {
          accommodation_included: boolean | null
          community_id: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          duration_weeks: number | null
          id: string
          includes: string[] | null
          is_published: boolean | null
          learning_outcomes: string[] | null
          max_participants: number | null
          meals_included: boolean | null
          price_amount: number | null
          price_currency: string | null
          slug: string
          start_dates: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          accommodation_included?: boolean | null
          community_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          includes?: string[] | null
          is_published?: boolean | null
          learning_outcomes?: string[] | null
          max_participants?: number | null
          meals_included?: boolean | null
          price_amount?: number | null
          price_currency?: string | null
          slug: string
          start_dates?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          accommodation_included?: boolean | null
          community_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          includes?: string[] | null
          is_published?: boolean | null
          learning_outcomes?: string[] | null
          max_participants?: number | null
          meals_included?: boolean | null
          price_amount?: number | null
          price_currency?: string | null
          slug?: string
          start_dates?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cultural_programmes_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      education_lessons: {
        Row: {
          body: string | null
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          module_id: string
          quiz_questions: Json | null
          sort_order: number | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          module_id: string
          quiz_questions?: Json | null
          sort_order?: number | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          module_id?: string
          quiz_questions?: Json | null
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "education_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      education_modules: {
        Row: {
          category: string
          community_id: string | null
          cover_image: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string | null
          estimated_minutes: number | null
          icon: string | null
          id: string
          is_published: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          community_id?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          community_id?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "education_modules_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invitations: {
        Row: {
          created_at: string
          event_id: string
          group_size: number | null
          id: string
          message: string | null
          notify_recurring: boolean | null
          responded_at: string | null
          response_message: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          group_size?: number | null
          id?: string
          message?: string | null
          notify_recurring?: boolean | null
          responded_at?: string | null
          response_message?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          group_size?: number | null
          id?: string
          message?: string | null
          notify_recurring?: boolean | null
          responded_at?: string | null
          response_message?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_photos: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string
          id: string
          is_approved: boolean | null
          photo_url: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id: string
          id?: string
          is_approved?: boolean | null
          photo_url: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string
          id?: string
          is_approved?: boolean | null
          photo_url?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "community_events"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_bookings: {
        Row: {
          booking_date: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          experience_id: string
          guest_count: number | null
          id: string
          special_requests: string | null
          start_time: string | null
          status: string | null
          total_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          experience_id: string
          guest_count?: number | null
          id?: string
          special_requests?: string | null
          start_time?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          experience_id?: string
          guest_count?: number | null
          id?: string
          special_requests?: string | null
          start_time?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_bookings_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_reviews: {
        Row: {
          body: string | null
          booking_id: string | null
          created_at: string
          experience_id: string
          id: string
          rating: number
          title: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          booking_id?: string | null
          created_at?: string
          experience_id: string
          id?: string
          rating: number
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          booking_id?: string | null
          created_at?: string
          experience_id?: string
          id?: string
          rating?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "experience_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_reviews_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          accessibility_notes: string | null
          available_days: string[] | null
          category: string
          community_id: string | null
          county: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          gallery_images: string[] | null
          host_bio: string | null
          host_name: string
          host_photo: string | null
          id: string
          includes: string[] | null
          is_featured: boolean | null
          is_published: boolean | null
          languages: string[] | null
          lat: number | null
          lng: number | null
          location_name: string | null
          max_guests: number | null
          min_guests: number | null
          price_amount: number
          price_currency: string | null
          price_display: string | null
          rating: number | null
          review_count: number | null
          short_description: string | null
          skill_level: string | null
          slug: string
          start_times: string[] | null
          subcategory: string | null
          title: string
          updated_at: string
          what_to_bring: string | null
          what_to_wear: string | null
        }
        Insert: {
          accessibility_notes?: string | null
          available_days?: string[] | null
          category?: string
          community_id?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          gallery_images?: string[] | null
          host_bio?: string | null
          host_name: string
          host_photo?: string | null
          id?: string
          includes?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_guests?: number | null
          min_guests?: number | null
          price_amount?: number
          price_currency?: string | null
          price_display?: string | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          skill_level?: string | null
          slug: string
          start_times?: string[] | null
          subcategory?: string | null
          title: string
          updated_at?: string
          what_to_bring?: string | null
          what_to_wear?: string | null
        }
        Update: {
          accessibility_notes?: string | null
          available_days?: string[] | null
          category?: string
          community_id?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          gallery_images?: string[] | null
          host_bio?: string | null
          host_name?: string
          host_photo?: string | null
          id?: string
          includes?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          max_guests?: number | null
          min_guests?: number | null
          price_amount?: number
          price_currency?: string | null
          price_display?: string | null
          rating?: number | null
          review_count?: number | null
          short_description?: string | null
          skill_level?: string | null
          slug?: string
          start_times?: string[] | null
          subcategory?: string | null
          title?: string
          updated_at?: string
          what_to_bring?: string | null
          what_to_wear?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      food_listings: {
        Row: {
          community_id: string | null
          contact_email: string | null
          contact_phone: string | null
          county: string | null
          cover_image: string | null
          created_at: string
          cuisine: string[] | null
          description: string | null
          dietary_options: string[] | null
          gallery_images: string[] | null
          host_bio: string | null
          host_name: string | null
          host_photo: string | null
          id: string
          is_community_kitchen: boolean | null
          is_farm_to_table: boolean | null
          is_featured: boolean | null
          is_home_dining: boolean | null
          is_published: boolean | null
          lat: number | null
          listing_type: string
          lng: number | null
          location_name: string | null
          max_guests: number | null
          name: string
          opening_hours: string | null
          price_currency: string | null
          price_display: string | null
          price_per_person: number | null
          price_range: string | null
          rating: number | null
          region: string | null
          review_count: number | null
          safety_rating: number | null
          short_description: string | null
          slug: string
          specialties: string[] | null
          traditional_dishes: string[] | null
          updated_at: string
        }
        Insert: {
          community_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          cuisine?: string[] | null
          description?: string | null
          dietary_options?: string[] | null
          gallery_images?: string[] | null
          host_bio?: string | null
          host_name?: string | null
          host_photo?: string | null
          id?: string
          is_community_kitchen?: boolean | null
          is_farm_to_table?: boolean | null
          is_featured?: boolean | null
          is_home_dining?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          listing_type?: string
          lng?: number | null
          location_name?: string | null
          max_guests?: number | null
          name: string
          opening_hours?: string | null
          price_currency?: string | null
          price_display?: string | null
          price_per_person?: number | null
          price_range?: string | null
          rating?: number | null
          region?: string | null
          review_count?: number | null
          safety_rating?: number | null
          short_description?: string | null
          slug: string
          specialties?: string[] | null
          traditional_dishes?: string[] | null
          updated_at?: string
        }
        Update: {
          community_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          cuisine?: string[] | null
          description?: string | null
          dietary_options?: string[] | null
          gallery_images?: string[] | null
          host_bio?: string | null
          host_name?: string | null
          host_photo?: string | null
          id?: string
          is_community_kitchen?: boolean | null
          is_farm_to_table?: boolean | null
          is_featured?: boolean | null
          is_home_dining?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          listing_type?: string
          lng?: number | null
          location_name?: string | null
          max_guests?: number | null
          name?: string
          opening_hours?: string | null
          price_currency?: string | null
          price_display?: string | null
          price_per_person?: number | null
          price_range?: string | null
          rating?: number | null
          region?: string | null
          review_count?: number | null
          safety_rating?: number | null
          short_description?: string | null
          slug?: string
          specialties?: string[] | null
          traditional_dishes?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_listings_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      food_recommendations: {
        Row: {
          body: string
          created_at: string
          dish_recommended: string | null
          id: string
          is_approved: boolean | null
          listing_id: string
          photo_url: string | null
          rating: number
          title: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          dish_recommended?: string | null
          id?: string
          is_approved?: boolean | null
          listing_id: string
          photo_url?: string | null
          rating: number
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          dish_recommended?: string | null
          id?: string
          is_approved?: boolean | null
          listing_id?: string
          photo_url?: string | null
          rating?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_recommendations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "food_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      genealogy_guides: {
        Row: {
          bio: string | null
          community_id: string | null
          contact_email: string | null
          contact_phone: string | null
          county: string | null
          created_at: string
          id: string
          is_published: boolean | null
          languages: string[] | null
          name: string
          photo_url: string | null
          price_currency: string | null
          price_per_session: number | null
          rating: number | null
          review_count: number | null
          slug: string
          specialties: string[] | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          community_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          languages?: string[] | null
          name: string
          photo_url?: string | null
          price_currency?: string | null
          price_per_session?: number | null
          rating?: number | null
          review_count?: number | null
          slug: string
          specialties?: string[] | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          community_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          languages?: string[] | null
          name?: string
          photo_url?: string | null
          price_currency?: string | null
          price_per_session?: number | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          specialties?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "genealogy_guides_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      group_outing_members: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          id: string
          joined_at: string
          name: string | null
          outing_id: string
          payment_status: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          id?: string
          joined_at?: string
          name?: string | null
          outing_id: string
          payment_status?: string | null
          phone?: string | null
          user_id: string
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          id?: string
          joined_at?: string
          name?: string | null
          outing_id?: string
          payment_status?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_outing_members_outing_id_fkey"
            columns: ["outing_id"]
            isOneToOne: false
            referencedRelation: "group_outings"
            referencedColumns: ["id"]
          },
        ]
      }
      group_outings: {
        Row: {
          budget_per_person: number | null
          county: string | null
          created_at: string
          description: string | null
          destination: string | null
          end_date: string | null
          group_size: number | null
          id: string
          invite_code: string | null
          is_public: boolean | null
          organizer_id: string
          outing_type: string
          package_id: string | null
          start_date: string
          status: string | null
          title: string
          total_budget: number | null
          updated_at: string
        }
        Insert: {
          budget_per_person?: number | null
          county?: string | null
          created_at?: string
          description?: string | null
          destination?: string | null
          end_date?: string | null
          group_size?: number | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          organizer_id: string
          outing_type?: string
          package_id?: string | null
          start_date: string
          status?: string | null
          title: string
          total_budget?: number | null
          updated_at?: string
        }
        Update: {
          budget_per_person?: number | null
          county?: string | null
          created_at?: string
          description?: string | null
          destination?: string | null
          end_date?: string | null
          group_size?: number | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          organizer_id?: string
          outing_type?: string
          package_id?: string | null
          start_date?: string
          status?: string | null
          title?: string
          total_budget?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_outings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "budget_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      group_trip_guides: {
        Row: {
          created_at: string
          guide_id: string
          id: string
          notes: string | null
          price_agreed: number | null
          role: string | null
          status: string | null
          trip_id: string
        }
        Insert: {
          created_at?: string
          guide_id: string
          id?: string
          notes?: string | null
          price_agreed?: number | null
          role?: string | null
          status?: string | null
          trip_id: string
        }
        Update: {
          created_at?: string
          guide_id?: string
          id?: string
          notes?: string | null
          price_agreed?: number | null
          role?: string | null
          status?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_trip_guides_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_trip_guides_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      group_trips: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          group_size: number | null
          id: string
          start_date: string
          status: string | null
          title: string
          total_price: number | null
          tourist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          group_size?: number | null
          id?: string
          start_date: string
          status?: string | null
          title: string
          total_price?: number | null
          tourist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          group_size?: number | null
          id?: string
          start_date?: string
          status?: string | null
          title?: string
          total_price?: number | null
          tourist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      guide_availability: {
        Row: {
          date: string
          guide_id: string
          id: string
          is_available: boolean | null
          notes: string | null
        }
        Insert: {
          date: string
          guide_id: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
        }
        Update: {
          date?: string
          guide_id?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_availability_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_bookings: {
        Row: {
          created_at: string
          end_date: string
          group_size: number | null
          guide_id: string
          guide_notes: string | null
          id: string
          message: string | null
          start_date: string
          status: string | null
          total_price: number | null
          tourist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          group_size?: number | null
          guide_id: string
          guide_notes?: string | null
          id?: string
          message?: string | null
          start_date: string
          status?: string | null
          total_price?: number | null
          tourist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          group_size?: number | null
          guide_id?: string
          guide_notes?: string | null
          id?: string
          message?: string | null
          start_date?: string
          status?: string | null
          total_price?: number | null
          tourist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_bookings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "group_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_reviews: {
        Row: {
          body: string | null
          booking_id: string | null
          created_at: string
          guide_id: string
          id: string
          rating: number
          title: string | null
          tourist_id: string
        }
        Insert: {
          body?: string | null
          booking_id?: string | null
          created_at?: string
          guide_id: string
          id?: string
          rating: number
          title?: string | null
          tourist_id: string
        }
        Update: {
          body?: string | null
          booking_id?: string | null
          created_at?: string
          guide_id?: string
          id?: string
          rating?: number
          title?: string | null
          tourist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "guide_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_reviews_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_skills: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          guide_id: string
          id: string
          score: number | null
          skill_category: string | null
          skill_name: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          guide_id: string
          id?: string
          score?: number | null
          skill_category?: string | null
          skill_name: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          guide_id?: string
          id?: string
          score?: number | null
          skill_category?: string | null
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_skills_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          bio: string | null
          certification_level: string | null
          certifications: string[] | null
          county: string | null
          created_at: string
          id: string
          is_available: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          lat: number | null
          lng: number | null
          location: string | null
          name: string
          photo_url: string | null
          price_currency: string | null
          price_per_day: number | null
          rating: number | null
          response_time_minutes: number | null
          review_count: number | null
          slug: string
          specializations: string[] | null
          total_bookings: number | null
          total_earnings: number | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          certification_level?: string | null
          certifications?: string[] | null
          county?: string | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          name: string
          photo_url?: string | null
          price_currency?: string | null
          price_per_day?: number | null
          rating?: number | null
          response_time_minutes?: number | null
          review_count?: number | null
          slug: string
          specializations?: string[] | null
          total_bookings?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          certification_level?: string | null
          certifications?: string[] | null
          county?: string | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          name?: string
          photo_url?: string | null
          price_currency?: string | null
          price_per_day?: number | null
          rating?: number | null
          response_time_minutes?: number | null
          review_count?: number | null
          slug?: string
          specializations?: string[] | null
          total_bookings?: number | null
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      heritage_forum_posts: {
        Row: {
          body: string
          category: string
          community_tag: string | null
          created_at: string
          id: string
          is_pinned: boolean | null
          reply_count: number | null
          title: string
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          body: string
          category?: string
          community_tag?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          reply_count?: number | null
          title: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          community_tag?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          reply_count?: number | null
          title?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      heritage_forum_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "heritage_forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "heritage_forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      homecoming_packages: {
        Row: {
          community_id: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          duration_days: number | null
          highlights: string[] | null
          id: string
          includes: string[] | null
          is_featured: boolean | null
          is_published: boolean | null
          max_guests: number | null
          price_amount: number | null
          price_currency: string | null
          rating: number | null
          review_count: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          community_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          highlights?: string[] | null
          id?: string
          includes?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          max_guests?: number | null
          price_amount?: number | null
          price_currency?: string | null
          rating?: number | null
          review_count?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          community_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          highlights?: string[] | null
          id?: string
          includes?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          max_guests?: number | null
          price_amount?: number | null
          price_currency?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homecoming_packages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_certificates: {
        Row: {
          certificate_type: string
          id: string
          issued_at: string
          share_token: string | null
          stats: Json | null
          title: string
          user_id: string
        }
        Insert: {
          certificate_type?: string
          id?: string
          issued_at?: string
          share_token?: string | null
          stats?: Json | null
          title: string
          user_id: string
        }
        Update: {
          certificate_type?: string
          id?: string
          issued_at?: string
          share_token?: string | null
          stats?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      internet_zones: {
        Row: {
          address: string | null
          city: string
          county: string | null
          created_at: string
          has_power: boolean | null
          id: string
          is_free: boolean | null
          is_published: boolean | null
          lat: number | null
          lng: number | null
          name: string
          provider: string | null
          reliability_score: number | null
          reported_by: string | null
          speed_mbps: number | null
          verified_at: string | null
          zone_type: string
        }
        Insert: {
          address?: string | null
          city: string
          county?: string | null
          created_at?: string
          has_power?: boolean | null
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          provider?: string | null
          reliability_score?: number | null
          reported_by?: string | null
          speed_mbps?: number | null
          verified_at?: string | null
          zone_type?: string
        }
        Update: {
          address?: string | null
          city?: string
          county?: string | null
          created_at?: string
          has_power?: boolean | null
          id?: string
          is_free?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          provider?: string | null
          reliability_score?: number | null
          reported_by?: string | null
          speed_mbps?: number | null
          verified_at?: string | null
          zone_type?: string
        }
        Relationships: []
      }
      long_stay_listings: {
        Row: {
          amenities: string[] | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          county: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          furnished: boolean | null
          gallery_images: string[] | null
          has_workspace: boolean | null
          id: string
          internet_speed_mbps: number | null
          is_available: boolean | null
          is_published: boolean | null
          lat: number | null
          lng: number | null
          max_guests: number | null
          min_stay_months: number | null
          name: string
          price_currency: string | null
          price_per_month: number
          property_type: string
          rating: number | null
          review_count: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          furnished?: boolean | null
          gallery_images?: string[] | null
          has_workspace?: boolean | null
          id?: string
          internet_speed_mbps?: number | null
          is_available?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          max_guests?: number | null
          min_stay_months?: number | null
          name: string
          price_currency?: string | null
          price_per_month?: number
          property_type?: string
          rating?: number | null
          review_count?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          furnished?: boolean | null
          gallery_images?: string[] | null
          has_workspace?: boolean | null
          id?: string
          internet_speed_mbps?: number | null
          is_available?: boolean | null
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          max_guests?: number | null
          min_stay_months?: number | null
          name?: string
          price_currency?: string | null
          price_per_month?: number
          property_type?: string
          rating?: number | null
          review_count?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      lost_found: {
        Row: {
          category: string | null
          contact_method: string | null
          county: string | null
          created_at: string
          description: string
          id: string
          is_published: boolean | null
          is_resolved: boolean | null
          lat: number | null
          lng: number | null
          location_name: string | null
          photo_url: string | null
          post_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          contact_method?: string | null
          county?: string | null
          created_at?: string
          description: string
          id?: string
          is_published?: boolean | null
          is_resolved?: boolean | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          photo_url?: string | null
          post_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          contact_method?: string | null
          county?: string | null
          created_at?: string
          description?: string
          id?: string
          is_published?: boolean | null
          is_resolved?: boolean | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          photo_url?: string | null
          post_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_accounts: {
        Row: {
          id: string
          member_since: string
          points: number | null
          tier: string | null
          total_spent_kes: number | null
          total_trips: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          member_since?: string
          points?: number | null
          tier?: string | null
          total_spent_kes?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          member_since?: string
          points?: number | null
          tier?: string | null
          total_spent_kes?: number | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          transaction_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          transaction_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          transaction_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketplace_orders: {
        Row: {
          buyer_id: string
          buyer_notes: string | null
          created_at: string
          custom_description: string | null
          id: string
          is_custom_order: boolean | null
          is_international: boolean | null
          payment_method: string | null
          price_currency: string | null
          product_id: string
          quantity: number | null
          seller_id: string
          seller_notes: string | null
          shipping_address: string | null
          shipping_country: string | null
          status: string | null
          total_price: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          buyer_notes?: string | null
          created_at?: string
          custom_description?: string | null
          id?: string
          is_custom_order?: boolean | null
          is_international?: boolean | null
          payment_method?: string | null
          price_currency?: string | null
          product_id: string
          quantity?: number | null
          seller_id: string
          seller_notes?: string | null
          shipping_address?: string | null
          shipping_country?: string | null
          status?: string | null
          total_price: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          buyer_notes?: string | null
          created_at?: string
          custom_description?: string | null
          id?: string
          is_custom_order?: boolean | null
          is_international?: boolean | null
          payment_method?: string | null
          price_currency?: string | null
          product_id?: string
          quantity?: number | null
          seller_id?: string
          seller_notes?: string | null
          shipping_address?: string | null
          shipping_country?: string | null
          status?: string | null
          total_price?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "marketplace_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          authenticity_notes: string | null
          category: string
          commission_starting_price: number | null
          cover_image: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          is_authentic_verified: boolean | null
          is_custom_commission: boolean | null
          is_featured: boolean | null
          is_preorder: boolean | null
          is_published: boolean | null
          made_by_story: string | null
          materials: string | null
          order_count: number | null
          preorder_lead_days: number | null
          price_amount: number
          price_currency: string | null
          price_display: string | null
          price_usd: number | null
          rating: number | null
          review_count: number | null
          seller_id: string
          slug: string
          stock_count: number | null
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          authenticity_notes?: string | null
          category?: string
          commission_starting_price?: number | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_authentic_verified?: boolean | null
          is_custom_commission?: boolean | null
          is_featured?: boolean | null
          is_preorder?: boolean | null
          is_published?: boolean | null
          made_by_story?: string | null
          materials?: string | null
          order_count?: number | null
          preorder_lead_days?: number | null
          price_amount?: number
          price_currency?: string | null
          price_display?: string | null
          price_usd?: number | null
          rating?: number | null
          review_count?: number | null
          seller_id: string
          slug: string
          stock_count?: number | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          authenticity_notes?: string | null
          category?: string
          commission_starting_price?: number | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_authentic_verified?: boolean | null
          is_custom_commission?: boolean | null
          is_featured?: boolean | null
          is_preorder?: boolean | null
          is_published?: boolean | null
          made_by_story?: string | null
          materials?: string | null
          order_count?: number | null
          preorder_lead_days?: number | null
          price_amount?: number
          price_currency?: string | null
          price_display?: string | null
          price_usd?: number | null
          rating?: number | null
          review_count?: number | null
          seller_id?: string
          slug?: string
          stock_count?: number | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "marketplace_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_sellers: {
        Row: {
          accepts_card: boolean | null
          accepts_commissions: boolean | null
          accepts_mpesa: boolean | null
          bio: string | null
          commission_lead_days: number | null
          community_id: string | null
          cooperative_members: number | null
          county: string | null
          created_at: string
          id: string
          is_cooperative: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          location: string | null
          mpesa_phone: string | null
          name: string
          photo_url: string | null
          rating: number | null
          review_count: number | null
          seller_type: string
          shipping_notes: string | null
          ships_internationally: boolean | null
          slug: string
          story: string | null
          total_sales: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepts_card?: boolean | null
          accepts_commissions?: boolean | null
          accepts_mpesa?: boolean | null
          bio?: string | null
          commission_lead_days?: number | null
          community_id?: string | null
          cooperative_members?: number | null
          county?: string | null
          created_at?: string
          id?: string
          is_cooperative?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          mpesa_phone?: string | null
          name: string
          photo_url?: string | null
          rating?: number | null
          review_count?: number | null
          seller_type?: string
          shipping_notes?: string | null
          ships_internationally?: boolean | null
          slug: string
          story?: string | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepts_card?: boolean | null
          accepts_commissions?: boolean | null
          accepts_mpesa?: boolean | null
          bio?: string | null
          commission_lead_days?: number | null
          community_id?: string | null
          cooperative_members?: number | null
          county?: string | null
          created_at?: string
          id?: string
          is_cooperative?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          mpesa_phone?: string | null
          name?: string
          photo_url?: string | null
          rating?: number | null
          review_count?: number | null
          seller_type?: string
          shipping_notes?: string | null
          ships_internationally?: boolean | null
          slug?: string
          story?: string | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_sellers_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_facilities: {
        Row: {
          county: string
          created_at: string
          emergency_phone: string | null
          facility_type: string
          has_ambulance: boolean | null
          has_emergency: boolean | null
          has_pharmacy: boolean | null
          id: string
          is_published: boolean | null
          lat: number | null
          lng: number | null
          location_name: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          services: string[] | null
        }
        Insert: {
          county: string
          created_at?: string
          emergency_phone?: string | null
          facility_type?: string
          has_ambulance?: boolean | null
          has_emergency?: boolean | null
          has_pharmacy?: boolean | null
          id?: string
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          services?: string[] | null
        }
        Update: {
          county?: string
          created_at?: string
          emergency_phone?: string | null
          facility_type?: string
          has_ambulance?: boolean | null
          has_emergency?: boolean | null
          has_pharmacy?: boolean | null
          id?: string
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          location_name?: string | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          services?: string[] | null
        }
        Relationships: []
      }
      multi_reviews: {
        Row: {
          body: string | null
          community_impact: number | null
          created_at: string
          cultural_authenticity: number | null
          flag_reason: string | null
          flagged_by: string | null
          guide_quality: number | null
          id: string
          is_flagged: boolean | null
          is_verified_visit: boolean | null
          language: string | null
          operator_response: string | null
          operator_response_at: string | null
          overall_rating: number
          photo_urls: string[] | null
          reviewable_id: string
          reviewable_type: string
          safety: number | null
          title: string | null
          translated_body: Json | null
          updated_at: string
          upvotes: number | null
          user_id: string
          value_for_money: number | null
          video_url: string | null
        }
        Insert: {
          body?: string | null
          community_impact?: number | null
          created_at?: string
          cultural_authenticity?: number | null
          flag_reason?: string | null
          flagged_by?: string | null
          guide_quality?: number | null
          id?: string
          is_flagged?: boolean | null
          is_verified_visit?: boolean | null
          language?: string | null
          operator_response?: string | null
          operator_response_at?: string | null
          overall_rating: number
          photo_urls?: string[] | null
          reviewable_id: string
          reviewable_type: string
          safety?: number | null
          title?: string | null
          translated_body?: Json | null
          updated_at?: string
          upvotes?: number | null
          user_id: string
          value_for_money?: number | null
          video_url?: string | null
        }
        Update: {
          body?: string | null
          community_impact?: number | null
          created_at?: string
          cultural_authenticity?: number | null
          flag_reason?: string | null
          flagged_by?: string | null
          guide_quality?: number | null
          id?: string
          is_flagged?: boolean | null
          is_verified_visit?: boolean | null
          language?: string | null
          operator_response?: string | null
          operator_response_at?: string | null
          overall_rating?: number
          photo_urls?: string[] | null
          reviewable_id?: string
          reviewable_type?: string
          safety?: number | null
          title?: string | null
          translated_body?: Json | null
          updated_at?: string
          upvotes?: number | null
          user_id?: string
          value_for_money?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      nomad_events: {
        Row: {
          city: string
          cover_image: string | null
          created_at: string
          current_attendees: number | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string
          id: string
          is_online: boolean | null
          is_published: boolean | null
          max_attendees: number | null
          online_link: string | null
          organizer_id: string | null
          organizer_name: string | null
          price: string | null
          slug: string
          start_time: string | null
          tags: string[] | null
          title: string
          venue: string | null
        }
        Insert: {
          city: string
          cover_image?: string | null
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string
          id?: string
          is_online?: boolean | null
          is_published?: boolean | null
          max_attendees?: number | null
          online_link?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          price?: string | null
          slug: string
          start_time?: string | null
          tags?: string[] | null
          title: string
          venue?: string | null
        }
        Update: {
          city?: string
          cover_image?: string | null
          created_at?: string
          current_attendees?: number | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_online?: boolean | null
          is_published?: boolean | null
          max_attendees?: number | null
          online_link?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          price?: string | null
          slug?: string
          start_time?: string | null
          tags?: string[] | null
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      nomad_forum_posts: {
        Row: {
          author_name: string | null
          body: string
          category: string
          created_at: string
          id: string
          is_pinned: boolean | null
          is_published: boolean | null
          reply_count: number | null
          tags: string[] | null
          title: string
          updated_at: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          author_name?: string | null
          body: string
          category?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          is_published?: boolean | null
          reply_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          author_name?: string | null
          body?: string
          category?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          is_published?: boolean | null
          reply_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      nomad_forum_replies: {
        Row: {
          author_name: string | null
          body: string
          created_at: string
          id: string
          post_id: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          post_id: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nomad_forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "nomad_forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_flags: {
        Row: {
          created_at: string
          evidence_urls: string[] | null
          flag_type: string
          id: string
          operator_id: string
          operator_type: string
          reason: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence_urls?: string[] | null
          flag_type?: string
          id?: string
          operator_id: string
          operator_type: string
          reason: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          evidence_urls?: string[] | null
          flag_type?: string
          id?: string
          operator_id?: string
          operator_type?: string
          reason?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      operator_impact_badges: {
        Row: {
          awarded_at: string
          badge_label: string
          badge_type: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          operator_id: string
          operator_type: string
          score: number | null
        }
        Insert: {
          awarded_at?: string
          badge_label: string
          badge_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          operator_id: string
          operator_type: string
          score?: number | null
        }
        Update: {
          awarded_at?: string
          badge_label?: string
          badge_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          operator_id?: string
          operator_type?: string
          score?: number | null
        }
        Relationships: []
      }
      operator_listings: {
        Row: {
          created_at: string
          id: string
          impact_score: number | null
          listing_id: string
          listing_name: string
          listing_type: string
          status: string
          total_bookings: number | null
          total_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          impact_score?: number | null
          listing_id: string
          listing_name: string
          listing_type?: string
          status?: string
          total_bookings?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          impact_score?: number | null
          listing_id?: string
          listing_name?: string
          listing_type?: string
          status?: string
          total_bookings?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      park_gates: {
        Row: {
          closing_time: string | null
          created_at: string
          entry_fee_nonresident: string | null
          entry_fee_resident: string | null
          entry_fee_vehicle: string | null
          gate_name: string
          id: string
          is_published: boolean | null
          lat: number | null
          lng: number | null
          notes: string | null
          opening_time: string | null
          park_name: string
          requirements: string[] | null
        }
        Insert: {
          closing_time?: string | null
          created_at?: string
          entry_fee_nonresident?: string | null
          entry_fee_resident?: string | null
          entry_fee_vehicle?: string | null
          gate_name: string
          id?: string
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          notes?: string | null
          opening_time?: string | null
          park_name: string
          requirements?: string[] | null
        }
        Update: {
          closing_time?: string | null
          created_at?: string
          entry_fee_nonresident?: string | null
          entry_fee_resident?: string | null
          entry_fee_vehicle?: string | null
          gate_name?: string
          id?: string
          is_published?: boolean | null
          lat?: number | null
          lng?: number | null
          notes?: string | null
          opening_time?: string | null
          park_name?: string
          requirements?: string[] | null
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          county: string | null
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
        }
        Insert: {
          county?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value?: number
          period_end: string
          period_start: string
        }
        Update: {
          county?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          period_end?: string
          period_start?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accessibility_needs: string[] | null
          avatar_url: string | null
          budget_range: string | null
          created_at: string
          first_visit: boolean | null
          full_name: string | null
          id: string
          languages: string[] | null
          nationality: string | null
          onboarding_completed: boolean | null
          travel_styles: string[] | null
          traveler_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accessibility_needs?: string[] | null
          avatar_url?: string | null
          budget_range?: string | null
          created_at?: string
          first_visit?: boolean | null
          full_name?: string | null
          id?: string
          languages?: string[] | null
          nationality?: string | null
          onboarding_completed?: boolean | null
          travel_styles?: string[] | null
          traveler_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accessibility_needs?: string[] | null
          avatar_url?: string | null
          budget_range?: string | null
          created_at?: string
          first_visit?: boolean | null
          full_name?: string | null
          id?: string
          languages?: string[] | null
          nationality?: string | null
          onboarding_completed?: boolean | null
          travel_styles?: string[] | null
          traveler_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_flags: {
        Row: {
          created_at: string
          flag_type: string
          id: string
          reason: string | null
          review_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          flag_type?: string
          id?: string
          reason?: string | null
          review_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          flag_type?: string
          id?: string
          reason?: string | null
          review_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_flags_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "multi_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      road_conditions: {
        Row: {
          condition: string
          created_at: string
          description: string | null
          id: string
          is_current: boolean | null
          lat: number | null
          lng: number | null
          photo_url: string | null
          reported_at: string
          route_name: string
          segment: string | null
          user_id: string
        }
        Insert: {
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          is_current?: boolean | null
          lat?: number | null
          lng?: number | null
          photo_url?: string | null
          reported_at?: string
          route_name: string
          segment?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          is_current?: boolean | null
          lat?: number | null
          lng?: number | null
          photo_url?: string | null
          reported_at?: string
          route_name?: string
          segment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      safety_alerts: {
        Row: {
          alert_type: string
          county: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          message: string
          region: string
          reported_by: string | null
          severity: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_type?: string
          county?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          message: string
          region: string
          reported_by?: string | null
          severity?: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          county?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          message?: string
          region?: string
          reported_by?: string | null
          severity?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_destinations: {
        Row: {
          destination_id: string
          id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          destination_id: string
          id?: string
          saved_at?: string
          user_id: string
        }
        Update: {
          destination_id?: string
          id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings_deposits: {
        Row: {
          amount: number
          created_at: string
          goal_id: string
          id: string
          mpesa_phone: string | null
          payment_method: string | null
          status: string | null
          transaction_ref: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          goal_id: string
          id?: string
          mpesa_phone?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_ref?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          goal_id?: string
          id?: string
          mpesa_phone?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_ref?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_deposits_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          destination: string | null
          id: string
          installment_amount: number | null
          installment_frequency: string | null
          package_id: string | null
          saved_amount: number | null
          status: string | null
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          id?: string
          installment_amount?: number | null
          installment_frequency?: string | null
          package_id?: string | null
          saved_amount?: number | null
          status?: string | null
          target_amount: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          id?: string
          installment_amount?: number | null
          installment_frequency?: string | null
          package_id?: string | null
          saved_amount?: number | null
          status?: string | null
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "budget_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_contributions: {
        Row: {
          amount_kes: number
          created_at: string
          id: string
          is_anonymous: boolean | null
          message: string | null
          project_id: string
          units: number | null
          user_id: string
        }
        Insert: {
          amount_kes: number
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          project_id: string
          units?: number | null
          user_id: string
        }
        Update: {
          amount_kes?: number
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          project_id?: string
          units?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "sponsorship_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsorship_projects: {
        Row: {
          community_id: string | null
          county: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          goal_amount_kes: number | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          project_type: string
          raised_amount_kes: number | null
          slug: string
          sponsor_count: number | null
          title: string
          unit_cost_kes: number | null
          unit_label: string | null
          units_completed: number | null
          units_goal: number | null
          updated_at: string
        }
        Insert: {
          community_id?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          goal_amount_kes?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          project_type?: string
          raised_amount_kes?: number | null
          slug: string
          sponsor_count?: number | null
          title: string
          unit_cost_kes?: number | null
          unit_label?: string | null
          units_completed?: number | null
          units_goal?: number | null
          updated_at?: string
        }
        Update: {
          community_id?: string | null
          county?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          goal_amount_kes?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          project_type?: string
          raised_amount_kes?: number | null
          slug?: string
          sponsor_count?: number | null
          title?: string
          unit_cost_kes?: number | null
          unit_label?: string | null
          units_completed?: number | null
          units_goal?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsorship_projects_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_bookings: {
        Row: {
          booking_type: string
          contact_phone: string | null
          created_at: string
          driver_id: string | null
          dropoff_location: string | null
          id: string
          passenger_count: number | null
          pickup_date: string
          pickup_location: string
          pickup_time: string | null
          price_currency: string | null
          return_date: string | null
          special_requests: string | null
          status: string | null
          total_price: number | null
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          booking_type?: string
          contact_phone?: string | null
          created_at?: string
          driver_id?: string | null
          dropoff_location?: string | null
          id?: string
          passenger_count?: number | null
          pickup_date: string
          pickup_location: string
          pickup_time?: string | null
          price_currency?: string | null
          return_date?: string | null
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          booking_type?: string
          contact_phone?: string | null
          created_at?: string
          driver_id?: string | null
          dropoff_location?: string | null
          id?: string
          passenger_count?: number | null
          pickup_date?: string
          pickup_location?: string
          pickup_time?: string | null
          price_currency?: string | null
          return_date?: string | null
          special_requests?: string | null
          status?: string | null
          total_price?: number | null
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "transport_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "transport_vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_drivers: {
        Row: {
          bio: string | null
          county: string | null
          created_at: string
          id: string
          is_available: boolean | null
          is_published: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          license_class: string | null
          location: string | null
          name: string
          phone: string | null
          photo_url: string | null
          rating: number | null
          review_count: number | null
          slug: string
          specializations: string[] | null
          total_trips: number | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          county?: string | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_class?: string | null
          location?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          review_count?: number | null
          slug: string
          specializations?: string[] | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          county?: string | null
          created_at?: string
          id?: string
          is_available?: boolean | null
          is_published?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_class?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          specializations?: string[] | null
          total_trips?: number | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      transport_routes: {
        Row: {
          created_at: string
          description: string | null
          destination: string
          difficulty: string | null
          distance_km: number | null
          duration_minutes: number | null
          elevation_gain_m: number | null
          frequency: string | null
          fuel_stations: string[] | null
          highlights: string[] | null
          id: string
          is_published: boolean | null
          name: string
          operating_hours: string | null
          origin: string
          price_display: string | null
          route_type: string
          slug: string
          stops: string[] | null
          trail_map_url: string | null
          vehicle_type: string | null
          warnings: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          destination: string
          difficulty?: string | null
          distance_km?: number | null
          duration_minutes?: number | null
          elevation_gain_m?: number | null
          frequency?: string | null
          fuel_stations?: string[] | null
          highlights?: string[] | null
          id?: string
          is_published?: boolean | null
          name: string
          operating_hours?: string | null
          origin: string
          price_display?: string | null
          route_type?: string
          slug: string
          stops?: string[] | null
          trail_map_url?: string | null
          vehicle_type?: string | null
          warnings?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          destination?: string
          difficulty?: string | null
          distance_km?: number | null
          duration_minutes?: number | null
          elevation_gain_m?: number | null
          frequency?: string | null
          fuel_stations?: string[] | null
          highlights?: string[] | null
          id?: string
          is_published?: boolean | null
          name?: string
          operating_hours?: string | null
          origin?: string
          price_display?: string | null
          route_type?: string
          slug?: string
          stops?: string[] | null
          trail_map_url?: string | null
          vehicle_type?: string | null
          warnings?: string[] | null
        }
        Relationships: []
      }
      transport_vehicles: {
        Row: {
          capacity: number | null
          created_at: string
          driver_id: string | null
          features: string[] | null
          id: string
          is_available: boolean | null
          is_published: boolean | null
          make: string | null
          model: string | null
          name: string
          photo_url: string | null
          plate_number: string | null
          price_currency: string | null
          price_display: string | null
          price_per_day: number
          price_per_km: number | null
          vehicle_type: string
          year: number | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          driver_id?: string | null
          features?: string[] | null
          id?: string
          is_available?: boolean | null
          is_published?: boolean | null
          make?: string | null
          model?: string | null
          name: string
          photo_url?: string | null
          plate_number?: string | null
          price_currency?: string | null
          price_display?: string | null
          price_per_day?: number
          price_per_km?: number | null
          vehicle_type?: string
          year?: number | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          driver_id?: string | null
          features?: string[] | null
          id?: string
          is_available?: boolean | null
          is_published?: boolean | null
          make?: string | null
          model?: string | null
          name?: string
          photo_url?: string | null
          plate_number?: string | null
          price_currency?: string | null
          price_display?: string | null
          price_per_day?: number
          price_per_km?: number | null
          vehicle_type?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "transport_drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_history: {
        Row: {
          created_at: string
          destination_id: string
          end_date: string | null
          id: string
          notes: string | null
          rating: number | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          destination_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          destination_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trusted_contacts: {
        Row: {
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          is_sharing_location: boolean | null
          last_shared_at: string | null
          last_shared_lat: number | null
          last_shared_lng: number | null
          sharing_started_at: string | null
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_sharing_location?: boolean | null
          last_shared_at?: string | null
          last_shared_lat?: number | null
          last_shared_lng?: number | null
          sharing_started_at?: string | null
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_sharing_location?: boolean | null
          last_shared_at?: string | null
          last_shared_lat?: number | null
          last_shared_lng?: number | null
          sharing_started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_certifications: {
        Row: {
          certification_type: string
          earned_at: string
          id: string
          modules_completed: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          certification_type: string
          earned_at?: string
          id?: string
          modules_completed?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          certification_type?: string
          earned_at?: string
          id?: string
          modules_completed?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_education_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string | null
          module_id: string
          quiz_score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id: string
          quiz_score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string
          quiz_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_education_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "education_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_education_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "education_modules"
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
      wildlife_sightings: {
        Row: {
          animal_count: number | null
          behavior: string | null
          created_at: string
          description: string | null
          id: string
          lat: number
          lng: number
          location_name: string
          park_name: string | null
          photo_url: string | null
          species: string
          species_category: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          animal_count?: number | null
          behavior?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lat: number
          lng: number
          location_name: string
          park_name?: string | null
          photo_url?: string | null
          species: string
          species_category?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          animal_count?: number | null
          behavior?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          location_name?: string
          park_name?: string | null
          photo_url?: string | null
          species?: string
          species_category?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chat_room_member: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "community_admin"
        | "guide"
        | "operator"
        | "gov_official"
        | "user"
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
      app_role: [
        "admin",
        "community_admin",
        "guide",
        "operator",
        "gov_official",
        "user",
      ],
    },
  },
} as const
