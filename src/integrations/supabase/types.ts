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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
