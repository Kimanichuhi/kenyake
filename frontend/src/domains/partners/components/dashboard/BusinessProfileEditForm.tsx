import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Lock, Plus, Trash2 } from "lucide-react";
import { usePartnerBusiness } from "@/components/RequirePartnerBusiness";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BusinessLocationPicker } from "../BusinessLocationPicker";
import { useBusinessDraftMutation } from "../../hooks/useBusinessDraftMutation";
import { useSaveBusinessContacts } from "../../hooks/useBusinessContacts";
import { isEditableStatus, MyBusiness } from "../../types/business";

const urlField = z
  .string()
  .trim()
  .url("Enter a valid URL (starting with http:// or https://)")
  .optional()
  .or(z.literal(""));

const contactSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  role: z.enum(["primary", "secondary", "emergency"]),
  designation: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  is_primary: z.boolean().optional(),
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Business name is required"),
  description: z.string().trim().optional(),
  registration_number: z.string().trim().optional(),
  kra_pin: z.string().trim().optional(),
  year_established: z.number().int().gte(1900).lte(2100).optional(),
  website_url: urlField,
  facebook_url: urlField,
  instagram_url: urlField,
  twitter_url: urlField,
  whatsapp_number: z.string().trim().optional(),

  county: z.string().trim().optional(),
  sub_county: z.string().trim().optional(),
  ward: z.string().trim().optional(),
  address_line: z.string().trim().optional(),
  postal_code: z.string().trim().optional(),
  nearby_landmark: z.string().trim().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),

  bank_name: z.string().trim().optional(),
  bank_account_name: z.string().trim().optional(),
  bank_account_number: z.string().trim().optional(),
  bank_branch: z.string().trim().optional(),
  mpesa_till_number: z.string().trim().optional(),
  mpesa_paybill_number: z.string().trim().optional(),

  contacts: z.array(contactSchema).min(1, "Add at least one contact person"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function toFormValues(business: MyBusiness): ProfileFormValues {
  return {
    name: business.name ?? "",
    description: business.description ?? "",
    registration_number: business.registration_number ?? "",
    kra_pin: business.kra_pin ?? "",
    year_established: business.year_established ?? undefined,
    website_url: business.website_url ?? "",
    facebook_url: business.facebook_url ?? "",
    instagram_url: business.instagram_url ?? "",
    twitter_url: business.twitter_url ?? "",
    whatsapp_number: business.whatsapp_number ?? "",

    county: business.county ?? "",
    sub_county: business.sub_county ?? "",
    ward: business.ward ?? "",
    address_line: business.address_line ?? "",
    postal_code: business.postal_code ?? "",
    nearby_landmark: business.nearby_landmark ?? "",
    lat: business.lat ?? undefined,
    lng: business.lng ?? undefined,

    bank_name: business.bank_name ?? "",
    bank_account_name: business.bank_account_name ?? "",
    bank_account_number: business.bank_account_number ?? "",
    bank_branch: business.bank_branch ?? "",
    mpesa_till_number: business.mpesa_till_number ?? "",
    mpesa_paybill_number: business.mpesa_paybill_number ?? "",

    contacts: business.business_contacts?.length
      ? business.business_contacts.map((c) => ({
          full_name: c.full_name,
          role: (c.role as "primary" | "secondary" | "emergency") ?? "primary",
          designation: c.designation ?? "",
          email: c.email ?? "",
          phone: c.phone ?? "",
          is_primary: c.is_primary ?? false,
        }))
      : [{ full_name: "", role: "primary", designation: "", email: "", phone: "", is_primary: true }],
  };
}

function lockedBannerCopy(status: string | undefined) {
  if (status === "approved") {
    return {
      title: "This business is live",
      description: "Your listing is live on Sync Safaris. Contact support if you need to update these details.",
    };
  }
  if (status === "rejected" || status === "suspended" || status === "archived") {
    return {
      title: "Editing is unavailable",
      description: "This business isn't in an editable state right now. Contact support if you believe this is a mistake.",
    };
  }
  return {
    title: "Your profile can't be edited right now",
    description:
      "Your application is under review, so profile changes are locked until we finish reviewing it or request more documents from you.",
  };
}

export function BusinessProfileEditForm() {
  const { business, refetch } = usePartnerBusiness();
  const upsertDraft = useBusinessDraftMutation();
  const saveContacts = useSaveBusinessContacts();

  const status = business.business_verification?.status;
  const editable = isEditableStatus(status);
  const banner = lockedBannerCopy(status);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(business),
  });

  useEffect(() => {
    form.reset(toFormValues(business));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business.id, business.updated_at]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "contacts" });

  const lat = form.watch("lat");
  const lng = form.watch("lng");

  const onSubmit = async (values: ProfileFormValues) => {
    const { contacts, ...businessFields } = values;

    await upsertDraft.mutateAsync({
      businessId: business.id,
      values: {
        ...businessFields,
        website_url: businessFields.website_url || null,
        facebook_url: businessFields.facebook_url || null,
        instagram_url: businessFields.instagram_url || null,
        twitter_url: businessFields.twitter_url || null,
      },
    });

    await saveContacts.mutateAsync({
      businessId: business.id,
      contacts: contacts.map((c) => ({
        full_name: c.full_name,
        role: c.role,
        designation: c.designation || undefined,
        email: c.email || undefined,
        phone: c.phone || undefined,
        is_primary: c.is_primary,
      })),
    });

    toast.success("Profile saved");
    refetch();
  };

  const isSaving = upsertDraft.isPending || saveContacts.isPending;
  const contactsRootError = form.formState.errors.contacts?.root?.message ?? form.formState.errors.contacts?.message;

  return (
    <div className="max-w-3xl space-y-6">
      {!editable && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>{banner.title}</AlertTitle>
          <AlertDescription>{banner.description}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <fieldset disabled={!editable} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.business_categories?.label && (
                  <p className="text-sm text-muted-foreground">
                    Category: <span className="font-medium text-foreground">{business.business_categories.label}</span>
                  </p>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="registration_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kra_pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>KRA PIN</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="year_established"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year established</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="facebook_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instagram_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="https://" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="twitter_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter / X</FormLabel>
                        <FormControl>
                          <Input placeholder="https://" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="whatsapp_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>County</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sub_county"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-county</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ward</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address_line"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nearby_landmark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nearby landmark</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormItem>
                  <FormLabel>Map location</FormLabel>
                  <BusinessLocationPicker
                    lat={lat}
                    lng={lng}
                    onChange={(newLat, newLng) => {
                      if (!editable) return;
                      form.setValue("lat", newLat, { shouldDirty: true });
                      form.setValue("lng", newLng, { shouldDirty: true });
                    }}
                  />
                </FormItem>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Banking & Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank_account_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bank_account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank_branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="mpesa_till_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>M-Pesa till number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mpesa_paybill_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>M-Pesa paybill number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Contact Persons</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ full_name: "", role: "secondary", designation: "", email: "", phone: "", is_primary: false })
                  }
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Add contact
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 rounded-md border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Contact {index + 1}</span>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.full_name`}
                        render={({ field: rhf }) => (
                          <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                              <Input {...rhf} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.role`}
                        render={({ field: rhf }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select value={rhf.value} onValueChange={rhf.onChange} disabled={!editable}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="primary">Primary</SelectItem>
                                <SelectItem value="secondary">Secondary</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.designation`}
                        render={({ field: rhf }) => (
                          <FormItem>
                            <FormLabel>Designation</FormLabel>
                            <FormControl>
                              <Input {...rhf} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.email`}
                        render={({ field: rhf }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...rhf} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`contacts.${index}.phone`}
                      render={({ field: rhf }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...rhf} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`contacts.${index}.is_primary`}
                      render={({ field: rhf }) => (
                        <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                          <FormLabel className="!mt-0">Primary contact</FormLabel>
                          <FormControl>
                            <Switch checked={!!rhf.value} onCheckedChange={rhf.onChange} disabled={!editable} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                {contactsRootError && <p className="text-sm font-medium text-destructive">{contactsRootError}</p>}
              </CardContent>
            </Card>
          </fieldset>

          <div className="flex justify-end">
            <Button type="submit" disabled={!editable || isSaving}>
              {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
