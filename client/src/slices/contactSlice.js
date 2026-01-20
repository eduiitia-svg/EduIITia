import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const sendContactEmail = createAsyncThunk(
  "contact/sendContactEmail",
  async ({ name, email, message }, { rejectWithValue }) => {
    try {
      const adminEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>New Contact Form Submission</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                  
                  <tr>
                    <td style="padding: 32px 40px; background: linear-gradient(135deg, #0f172a 0%, #334155 100%);">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td>
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">New Inquiry</h1>
                            <p style="margin: 5px 0 0; font-size: 14px; color: #cbd5e1;">Received from EduIITia Contact Form</p>
                          </td>
                          <td align="right">
                            <span style="background-color: rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 6px; color: #ffffff; font-size: 12px; font-weight: 600;">ADMIN</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                        <tr>
                          <td width="40" valign="top" style="padding-right: 16px;">
                            <div style="width: 40px; height: 40px; background-color: #f0f9ff; border-radius: 50%; text-align: center; line-height: 40px; font-size: 18px;">👤</div>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Sender Name</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #0f172a; font-weight: 600;">${name}</p>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
                        <tr>
                          <td width="40" valign="top" style="padding-right: 16px;">
                            <div style="width: 40px; height: 40px; background-color: #f0fdf4; border-radius: 50%; text-align: center; line-height: 40px; font-size: 18px;">✉️</div>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Reply Email</p>
                            <a href="mailto:${email}" style="margin: 4px 0 0; font-size: 16px; color: #2563eb; text-decoration: none; font-weight: 500; display: block;">${email}</a>
                          </td>
                        </tr>
                      </table>

                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                        <p style="margin: 0 0 12px; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message Content</p>
                        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${message}</p>
                      </div>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px;">
                        <tr>
                          <td align="center">
                            <a href="mailto:${email}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; border-radius: 8px; text-decoration: none; transition: background-color 0.2s;">Reply to ${name.split(" ")[0]}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8;">Sent via EduIITia Contact System • ${new Date().toLocaleDateString()}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const userEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>We received your message</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                  
                  <tr>
                    <td align="center" style="padding: 40px 40px 30px; background-color: #ffffff;">
                       <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                          <span style="font-size: 40px;">✨</span>
                       </div>
                       <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">We got it!</h1>
                       <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #4b5563;">Hi ${name}, thanks for reaching out.</p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 16px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #115e59; font-weight: 500;">
                          ✓ Status: <strong>Received & Queued for Review</strong>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 30px 40px 40px;">
                      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #374151;">
                        This is an automatic confirmation that your message has been successfully delivered to the <strong>EduIITia</strong> support team. 
                      </p>
                      
                      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #374151;">
                        We usually respond within <strong>24 hours</strong>. While you wait, here is a copy of what you sent us:
                      </p>

                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                         <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280; font-style: italic;">
                           "${message.length > 200 ? message.substring(0, 200) + "..." : message}"
                         </p>
                      </div>

                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #111827; padding: 32px 40px; text-align: center;">
                      <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #ffffff;">EduIITia</p>
                      <p style="margin: 0 0 24px; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                        Empowering communities to learn, connect, and grow together.
                      </p>
                      
                      <p style="margin: 0; font-size: 12px; color: #4b5563;">
                        <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Help Center</a> •
                        <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      await axios.post(`${import.meta.env.VITE_API_URL}/api/sendEmail`, {
        to: import.meta.env.VITE_ADMIN_EMAIL,
        subject: `🔔 New Contact: ${name}`,
        html: adminEmailHTML,
      });

      await axios.post(`${import.meta.env.VITE_API_URL}/api/sendEmail`, {
        to: email,
        subject: "Message Received! 🚀 - EduIITia Support",
        html: userEmailHTML,
      });

      return { success: true, message: "Emails sent successfully" };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Email sending failed",
      );
    }
  },
);

export const sendPartnerInquiry = createAsyncThunk(
  "contact/sendPartnerInquiry",
  async (
    { name, email, phone, instituteName, message },
    { rejectWithValue },
  ) => {
    try {
      const adminEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>New Partner Inquiry</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                  
                  <tr>
                    <td style="padding: 32px 40px; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td>
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">🤝 New Partner Inquiry</h1>
                            <p style="margin: 5px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">Admin Account Request from EduIITia</p>
                          </td>
                          <td align="right">
                            <span style="background-color: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 6px; color: #ffffff; font-size: 12px; font-weight: 600;">PARTNER</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 40px;">
                      <div style="background-color: #ecfdf5; border-left: 4px solid #14b8a6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 600;">
                          🏢 Institute Partnership Request
                        </p>
                      </div>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                        <tr>
                          <td width="40" valign="top" style="padding-right: 16px;">
                            <div style="width: 40px; height: 40px; background-color: #ccfbf1; border-radius: 50%; text-align: center; line-height: 40px; font-size: 18px;">👤</div>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contact Person</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #0f172a; font-weight: 600;">${name}</p>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                        <tr>
                          <td width="40" valign="top" style="padding-right: 16px;">
                            <div style="width: 40px; height: 40px; background-color: #dbeafe; border-radius: 50%; text-align: center; line-height: 40px; font-size: 18px;">🏛️</div>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Institute Name</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #0f172a; font-weight: 600;">${instituteName}</p>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                        <tr>
                          <td width="40" valign="top" style="padding-right: 16px;">
                            <div style="width: 40px; height: 40px; background-color: #f0fdf4; border-radius: 50%; text-align: center; line-height: 40px; font-size: 18px;">✉️</div>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</p>
                            <a href="mailto:${email}" style="margin: 4px 0 0; font-size: 16px; color: #2563eb; text-decoration: none; font-weight: 500; display: block;">${email}</a>
                          </td>
                        </tr>
                      </table>

                      ${
                        phone
                          ? `
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                        <tr>
                          <td width="40" valign="top" style="padding-right: 16px;">
                            <div style="width: 40px; height: 40px; background-color: #fef3c7; border-radius: 50%; text-align: center; line-height: 40px; font-size: 18px;">📱</div>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</p>
                            <p style="margin: 4px 0 0; font-size: 16px; color: #0f172a; font-weight: 500;">${phone}</p>
                          </td>
                        </tr>
                      </table>
                      `
                          : ""
                      }

                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-top: 24px;">
                        <p style="margin: 0 0 12px; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Requirements / Message</p>
                        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${message}</p>
                      </div>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px;">
                        <tr>
                          <td align="center">
                            <a href="mailto:${email}" style="display: inline-block; background-color: #14b8a6; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 600; border-radius: 8px; text-decoration: none;">Reply to ${name.split(" ")[0]}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 12px; color: #94a3b8;">Partner Inquiry via EduIITia • ${new Date().toLocaleDateString()}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const partnerEmailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Thank you for your interest!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                  
                  <tr>
                    <td align="center" style="padding: 40px 40px 30px; background-color: #ffffff;">
                       <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                          <span style="font-size: 40px;">🤝</span>
                       </div>
                       <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">Thank You for Your Interest!</h1>
                       <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #4b5563;">Hi ${name}, we're excited about potential partnership opportunities.</p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="background-color: #ecfdf5; border-left: 4px solid #14b8a6; padding: 16px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #065f46; font-weight: 500;">
                          ✓ Status: <strong>Partner Inquiry Received</strong>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 30px 40px 40px;">
                      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #374151;">
                        We've received your partnership inquiry for <strong>${instituteName}</strong>. Our team will review your request and get back to you within <strong>24-48 hours</strong> to discuss how EduIITia can support your educational institution.
                      </p>
                      
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                         <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">What's Next?</p>
                         <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                           <li>Our team will review your requirements</li>
                           <li>We'll prepare a customized solution proposal</li>
                           <li>Schedule a demo call to discuss features</li>
                           <li>Finalize partnership terms and onboarding</li>
                         </ul>
                      </div>

                      <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">
                        In the meantime, feel free to explore our <a href="#" style="color: #14b8a6; text-decoration: none; font-weight: 500;">platform features</a> or reach out if you have any immediate questions.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #111827; padding: 32px 40px; text-align: center;">
                      <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #ffffff;">EduIITia</p>
                      <p style="margin: 0 0 24px; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                        Empowering educational institutions with innovative learning solutions.
                      </p>
                      
                      <p style="margin: 0; font-size: 12px; color: #4b5563;">
                        <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Partnership Info</a> •
                        <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 8px;">Contact Us</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      await axios.post(`${import.meta.env.VITE_API_URL}/api/sendEmail`, {
        to: import.meta.env.VITE_ADMIN_EMAIL,
        subject: `🤝 New Partner Inquiry: ${instituteName}`,
        html: adminEmailHTML,
      });

      await axios.post(`${import.meta.env.VITE_API_URL}/api/sendEmail`, {
        to: email,
        subject: "Thank You for Your Partnership Interest! 🤝 - EduIITia",
        html: partnerEmailHTML,
      });

      return {
        success: true,
        message: "Partner inquiry submitted successfully",
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to submit partner inquiry",
      );
    }
  },
);

const contactSlice = createSlice({
  name: "contact",
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetContactForm: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendContactEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(sendContactEmail.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(sendContactEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetContactForm } = contactSlice.actions;
export default contactSlice.reducer;
