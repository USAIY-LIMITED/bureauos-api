import type { PrismaClient } from '@prisma/client';

const waitlistWelcomeBody = ` 
            <h1 style="color: #1A1813; font-size: 30px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">
                You're in! Welcome to BureauOS Early Access</h1>
 
            <div style="color: #524D44; font-size: 17px; margin-bottom: 32px; font-weight: 400; line-height: 1.6;">
                Hi {{firstName}},<br/>
                Thanks for joining us. You have been successfully added to our early access list!
            </div>
 
            <div
                style="background-color: #F4F1EC; border-radius: 20px; padding: 32px; margin-bottom: 32px; border: 1px solid #E4DFD6; text-align: left;">
                <div
                    style="display: inline-block; background: #FBFAF8; padding: 12px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="#2C5378" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                </div>
                <div style="color: #1A1813; font-size: 17px; font-weight: 700; margin-bottom: 10px;">What we are building</div>
                <p style="color: #524D44; font-size: 15px; line-height: 1.7; margin: 0;">
                    We are building a structured compliance operating system for global businesses, designed specifically for founders and professionals navigating complex international markets like the UK.
                </p>
                <p style="color: #524D44; font-size: 15px; line-height: 1.7; margin: 14px 0 0 0;">As an early access member, you will be among the first to:</p>
                <ul style="margin: 14px 0 0 0; padding: 0; list-style: none;">
                    <li
                        style="display: flex; align-items: flex-start; gap: 10px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                        <span
                            style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
                        Gain exclusive access to the platform.
                    </li>
                    <li
                        style="display: flex; align-items: flex-start; gap: 10px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                        <span
                            style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
                        Test early workflows and compliance tools.
                    </li>
                    <li
                        style="display: flex; align-items: flex-start; gap: 10px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 10px;">
                        <span
                            style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
                        Easily structure and manage operations across different jurisdictions.
                    </li>
                </ul>
            </div>
 
            <div style="border-left: 3px solid #D6CFC2; padding: 12px 20px; margin: 24px 0; text-align: left;">
                <p
                    style="color: #524D44; font-size: 14px; font-style: italic; font-weight: 500; margin: 0; line-height: 1.6;">
                    Most businesses do not fail because of their product; they fail because of their structure.
                </p>
            </div>
 
            <div style="text-align: left; margin-top: 32px; padding-top: 32px; border-top: 1px solid #E4DFD6;">
                <div
                    style="text-transform: uppercase; font-size: 12px; font-weight: 700; color: #8C857A; letter-spacing: 0.1em; margin-bottom: 20px; text-align: center;">
                    What is Next?</div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                    <div
                        style="background: #EDE9E2; color: #2C5378; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; margin-top: 2px;">
                        1</div>
                    <div style="color: #524D44; font-size: 14px; font-weight: 500; padding-top: 3px;">We will share platform updates as we build.</div>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                    <div
                        style="background: #EDE9E2; color: #2C5378; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; margin-top: 2px;">
                        2</div>
                    <div style="color: #524D44; font-size: 14px; font-weight: 500; padding-top: 3px;">You will get early access before the public launch.</div>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 14px;">
                    <div
                        style="background: #EDE9E2; color: #2C5378; width: 24px; height: 24px; min-width: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; margin-right: 12px; margin-top: 2px;">
                        3</div>
                    <div style="color: #524D44; font-size: 14px; font-weight: 500; padding-top: 3px;">You can shape workflows with your real-world feedback.</div>
                </div>
            </div>`;

const emailTemplates = [
  {
    slug: 'waitlist-welcome',
    subject: 'Welcome to BureauOS!',
    title: 'Success! You are on the Waitlist',
    body: waitlistWelcomeBody,
  },
  {
    slug: 'email-verification',
    subject: 'Verify your BureauOS account',
    title: 'Your verification code',
    body: `
        <h1 style="color: #0f172a; font-size: 26px; font-weight: 800; margin: 0 0 12px;">
          Verify your email address
        </h1>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 32px;">
          Hi {{firstName}}, use the code below to verify your BureauOS account.
          This code expires in 15 minutes.
        </p>
        <div style="background: #f0f7ff; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 32px; border: 1px solid #e0f0ff;">
          <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #1d4ed8; font-family: monospace;">
            {{code}}
          </div>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
          If you did not request this, you can safely ignore this email.
        </p>`,
  },
  {
    slug: 'password-reset',
    subject: 'Reset your BureauOS password',
    title: 'Password reset request',
    body: `
        <h1 style="color: #0f172a; font-size: 26px; font-weight: 800; margin: 0 0 12px;">
          Reset your password
        </h1>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 32px;">
          Hi {{firstName}}, we received a request to reset your password.
          Click the button below — this link expires in 1 hour.
        </p>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="{{resetUrl}}"
            style="display: inline-block; background: #1d4ed8; color: #ffffff; font-size: 16px;
                   font-weight: 700; padding: 16px 40px; border-radius: 12px; text-decoration: none;">
            Reset Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
          If you did not request a password reset, you can safely ignore this email.
        </p>`,
  },
  {
    slug: 'ng-uk-founder-welcome',
    subject: 'Welcome to BureauOS — The Nigeria → UK Corridor',
    title: 'Welcome to BureauOS!',
    body: `
        <h1 style="color: #1A1813; font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">Welcome to BureauOS — The Nigeria → UK Corridor</h1>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          Hi {{fullName}},<br/><br/>
          You're building something in Nigeria. And you're thinking about the UK.<br/><br/>
          That puts you in a specific group of founders who see what's possible. Most Nigerian founders stay local out of inertia or fear. You're looking ahead. That's the first signal of a founder who'll go far.
        </div>
        <div style="background-color: #F4F1EC; border-radius: 20px; padding: 24px; margin-bottom: 24px; border: 1px solid #E4DFD6; text-align: left;">
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 10px;">Here's what BureauOS is building:</div>
          <p style="color: #524D44; font-size: 15px; line-height: 1.6; margin: 0;">
            We're creating the structuring layer for Nigerian founders expanding to the UK. Not a marketplace. Not a directory. A structured, step-by-step system that handles the compliance, governance, and entity setup you need — from CAC registration to Companies House setup.
          </p>
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin: 20px 0 10px;">Here's what's coming for you specifically:</div>
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              A Nigeria→UK playbook (regulatory roadmap, common pitfalls, timeline)
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Orin-generated structuring checklists tailored to your stage
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Early access to our structuring program (limited spots)
            </li>
          </ul>
        </div>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          Over the next few weeks, I'll share what we're learning from founders who've already made the leap — and from those who tried and hit walls.<br/><br/>
          <strong>One thing I'd love from you:</strong><br/>
          Reply to this email and tell me: what's the one thing you're most unsure about when it comes to expanding to the UK?<br/><br/>
          Your answer will shape what I send you next.
        </div>
        <div style="color: #524D44; font-size: 16px; font-weight: 600; margin-top: 24px;">
          More soon.<br/><br/>
          — Orin<br/>
          BureauOS
        </div>`,
  },
  {
    slug: 'ng-uk-founder-nurture-1',
    subject: 'The 3 gaps that kill Nigerian founders in the UK',
    title: 'The 3 gaps that kill Nigerian founders in the UK',
    body: `
        <h1 style="color: #1A1813; font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">The 3 gaps that kill Nigerian founders in the UK</h1>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          Hi {{fullName}},<br/><br/>
          I've been studying why some Nigerian founders succeed in the UK and others stall. Across the board, three gaps come up again and again.
        </div>
        <div style="background-color: #F4F1EC; border-radius: 20px; padding: 24px; margin-bottom: 24px; border: 1px solid #E4DFD6; text-align: left;">
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 6px;">1. Entity structure mismatch</div>
          <p style="color: #524D44; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Most Nigerian founders register a UK company without understanding the difference between a private limited company (Ltd) and setting up a UK branch of their Nigerian entity. The wrong structure costs you on tax, liability, and future fundraising.
          </p>
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 6px;">2. Missing the "substance" requirement</div>
          <p style="color: #524D44; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            HMRC and UK banks increasingly require that your UK entity has real economic substance — a physical presence, actual decision-making happening in the UK, not just a registered address. Many Nigerian founders get their accounts frozen because they can't satisfy this.
          </p>
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 6px;">3. Personal vs. business liability</div>
          <p style="color: #524D44; font-size: 15px; line-height: 1.6; margin: 0;">
            Founders crossing from Nigeria often carry personal liability into their UK structure. One wrong contract signature and your personal assets in both jurisdictions are exposed.
          </p>
        </div>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          <strong>What we're doing about this:</strong><br/>
          We're building checklists that flag these gaps before they become problems. Orin, our AI structuring engine, is being trained on UK-Nigeria cross-border compliance specifically.<br/><br/>
          <strong>What you can do right now:</strong><br/>
          If you're in the early stages of UK expansion, there's one thing that will save you months: get your entity structure right before you file anything. Everything else flows from that.<br/><br/>
          Reply if you want me to send you a simple checklist I've been working on.
        </div>
        <div style="color: #524D44; font-size: 16px; font-weight: 600; margin-top: 24px;">
          — Orin
        </div>`,
  },
  {
    slug: 'ng-uk-founder-cta',
    subject: "We're structuring 3 Nigerian founders for the UK — want in?",
    title: "We're structuring 3 Nigerian founders for the UK — want in?",
    body: `
        <h1 style="color: #1A1813; font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">We're structuring 3 Nigerian founders for the UK — want in?</h1>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          Hi {{fullName}},<br/><br/>
          We've been heads-down building.<br/><br/>
          The Nigeria→UK playbook is nearly complete. Orin has been trained on UK Companies House requirements, Nigerian CAC regulations, and the cross-border tax treaties that matter.<br/><br/>
          Now we need to stress-test it with real founders.<br/><br/>
          <strong>We're looking for 3 Nigerian founders who are actively expanding to the UK.</strong>
        </div>
        <div style="background-color: #F4F1EC; border-radius: 20px; padding: 24px; margin-bottom: 24px; border: 1px solid #E4DFD6; text-align: left;">
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 10px;">If you're selected:</div>
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              We'll structure your UK entity setup end-to-end (free of charge)
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              You'll get direct access to our compliance roadmap before anyone else
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Orin will generate a personalized structuring checklist based on your specific business type and stage
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              We handle the documentation, you focus on building
            </li>
          </ul>
        </div>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          <strong>What we need from you:</strong><br/>
          A 30-minute call to understand your business and expansion timeline. That's it.<br/><br/>
          This isn't a sales pitch. We're validating our model before we open it publicly. Your feedback will shape the product.<br/><br/>
          <strong>Reply to this email with "I'm in" and I'll send you a Calendly link.</strong><br/><br/>
          Spots are limited. First come.
        </div>
        <div style="color: #524D44; font-size: 16px; font-weight: 600; margin-top: 24px;">
          — Orin
        </div>`,
  },
  {
    slug: 'welcome-qatar-partnership',
    subject: "You + Qatar? We're exploring that too.",
    title: "You + Qatar? We're exploring that too.",
    body: `
        <h1 style="color: #1A1813; font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">You + Qatar? We're exploring that too.</h1>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          Hi {{fullName}},<br/><br/>
          You told us you're interested in Qatar.<br/><br/>
          That caught our attention — because we're building something in that direction.
        </div>
        <div style="background-color: #F4F1EC; border-radius: 20px; padding: 24px; margin-bottom: 24px; border: 1px solid #E4DFD6; text-align: left;">
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 10px;">Here's what's happening:</div>
          <p style="color: #524D44; font-size: 15px; line-height: 1.6; margin: 0;">
            We're in active conversations with ecosystem partners in Qatar (accelerators, free zones, government programs) to create a structured pathway for founders looking to set up in the region.<br/><br/>
            Qatar is actively courting tech founders. The QFC (Qatar Financial Centre) offers 100% foreign ownership. The startup ecosystem is smaller than UAE but growing faster in specific verticals — fintech, logistics, healthtech.
          </p>
        </div>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          <strong>Why I'm telling you this now:</strong><br/>
          When our Qatar partnership goes live, you'll be first to know. And because you expressed interest early, you'll be at the front of the line for any pilot program or structured setup support we offer.<br/><br/>
          <strong>What you can do right now:</strong><br/>
          Reply to this email and tell me what sector you're in. Qatar has specific advantages per vertical — I'd love to share what I'm learning about your space.
        </div>
        <div style="color: #524D44; font-size: 16px; font-weight: 600; margin-top: 24px;">
          More soon.<br/><br/>
          — Orin
        </div>`,
  },
  {
    slug: 'qatar-application-open',
    subject: "The Qatar partnership is live — you're first in line",
    title: "The Qatar partnership is live — you're first in line",
    body: `
        <h1 style="color: #1A1813; font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">The Qatar partnership is live — you're first in line</h1>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          Hi {{fullName}},<br/><br/>
          Months ago you told us you were interested in Qatar. We promised we'd come back when something was ready.<br/><br/>
          It's ready.<br/><br/>
          <strong>The BureauOS × {{partnerName}} Qatar Program is now open.</strong>
        </div>
        <div style="background-color: #F4F1EC; border-radius: 20px; padding: 24px; margin-bottom: 24px; border: 1px solid #E4DFD6; text-align: left;">
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 10px;">Here's what this gives you:</div>
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              A structured pathway to set up your Qatar entity (QFC or free zone setup)
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Regulatory guidance tailored to your sector
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Direct introductions to the partner ecosystem (funding, talent, office space)
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Orin-generated compliance checklist for Qatar-specific requirements
            </li>
          </ul>
        </div>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          <strong>Because you were on our waitlist early, you get:</strong><br/>
          Priority review of your application. Fast-tracked access to the program resources. No application fee.<br/><br/>
          <strong>What to do next:</strong><br/><br/>
          <div style="text-align: left; margin-bottom: 24px;">
            <a href="{{applicationUrl}}" style="display: inline-block; background: #2C5378; color: #ffffff; font-size: 16px; font-weight: 700; padding: 12px 28px; border-radius: 12px; text-decoration: none;">
              Submit Application
            </a>
          </div>
          The first cohort has limited spots. Applications close {{deadlineDate}}.<br/><br/>
          If Qatar is still on your roadmap, this is the time.
        </div>
        <div style="color: #524D44; font-size: 16px; font-weight: 600; margin-top: 24px;">
          — Orin
        </div>`,
  },
  {
    slug: 'qatar-deadline-reminder',
    subject: "⏳ Qatar program deadline in 48 hours",
    title: "⏳ Qatar program deadline in 48 hours",
    body: `
        <h1 style="color: #1A1813; font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">⏳ Qatar program deadline in 48 hours</h1>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          Hi {{fullName}},<br/><br/>
          This is your last reminder.<br/><br/>
          The BureauOS × {{partnerName}} Qatar Program closes in <strong>48 hours</strong>.<br/><br/>
          You're on our waitlist because you expressed interest in Qatar. I want to make sure you don't miss this.
        </div>
        <div style="background-color: #F4F1EC; border-radius: 20px; padding: 24px; margin-bottom: 24px; border: 1px solid #E4DFD6; text-align: left;">
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 10px;">Who should apply:</div>
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Founders looking to set up a Qatar entity for the first time
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Founders expanding from another market into MENA
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Anyone who wants structured support (not just a directory)
            </li>
          </ul>
        </div>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          <strong>What happens if you miss this window:</strong><br/>
          The program will reopen, but priority access, fee waivers, and fast-tracked review won't be guaranteed.<br/><br/>
          <div style="text-align: left; margin-bottom: 24px;">
            <a href="{{applicationUrl}}" style="display: inline-block; background: #2C5378; color: #ffffff; font-size: 16px; font-weight: 700; padding: 12px 28px; border-radius: 12px; text-decoration: none;">
              Apply Here
            </a>
          </div>
          If Qatar is still on your mind, this is the moment to act.
        </div>
        <div style="color: #524D44; font-size: 16px; font-weight: 600; margin-top: 24px;">
          — Orin
        </div>`,
  },
  {
    slug: 'ecosystem-partner-welcome',
    subject: "You're a professional. We're building for your clients.",
    title: "You're a professional. We're building for your clients.",
    body: `
        <h1 style="color: #1A1813; font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">You're a professional. We're building for your clients.</h1>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          Hi {{fullName}},<br/><br/>
          You signed up as a professional — lawyer, accountant, consultant. That tells me you work with founders who are navigating cross-border expansion.
        </div>
        <div style="background-color: #F4F1EC; border-radius: 20px; padding: 24px; margin-bottom: 24px; border: 1px solid #E4DFD6; text-align: left;">
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 10px;">Here's what we're building:</div>
          <p style="color: #524D44; font-size: 15px; line-height: 1.6; margin: 0;">
            BureauOS is a structuring layer for founders expanding across borders. Think structured compliance checklists, entity setup roadmaps, and an AI engine (Orin) that generates personalized governance plans.
          </p>
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin: 20px 0 10px;">Why this matters to you:</div>
          <p style="color: #524D44; font-size: 15px; line-height: 1.6; margin: 0;">
            Your clients are asking you questions about UK entity setup. UAE free zones. Qatar expansion. And you're spending billable hours on the same foundational questions over and over.<br/><br/>
            We're not building a replacement for your expertise. We're building a tool that:
          </p>
          <ul style="margin: 14px 0 0 0; padding: 0; list-style: none;">
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Pre-qualifies your clients before they come to you (they arrive more prepared)
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Generates first-draft checklists that you can review (saves you hours)
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Keeps your clients compliant between engagements (reduces fire drills)
            </li>
          </ul>
        </div>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          <strong>What I'd love from you:</strong><br/><br/>
          Reply to this email and tell me: what's the most common cross-border question your clients ask you right now? Your answer will shape what we build next.<br/><br/>
          Also — if you'd like to be part of our professional partner network when we launch, let me know. Early partners get priority referrals.
        </div>
        <div style="color: #524D44; font-size: 16px; font-weight: 600; margin-top: 24px;">
          — Orin
        </div>`,
  },
  {
    slug: 'local-focus-welcome',
    subject: 'Structure before you scale — even if you stay local',
    title: 'Structure before you scale — even if you stay local',
    body: `
        <h1 style="color: #1A1813; font-size: 26px; font-weight: 800; margin: 0 0 12px; letter-spacing: -0.02em;">Structure before you scale — even if you stay local</h1>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          Hi {{fullName}},<br/><br/>
          You signed up for BureauOS and told us you're not planning to expand — at least not yet.<br/><br/>
          That's completely fine. In fact, it's smart.<br/><br/>
          Here's a truth that most founders learn too late: <strong>the best time to set up your structure is before you need it.</strong><br/><br/>
          Whether you're serving Nigerian customers, building for the local market, or keeping your options open for later — having your governance, cap table, and compliance in order now saves you from painful restructurings later.
        </div>
        <div style="background-color: #F4F1EC; border-radius: 20px; padding: 24px; margin-bottom: 24px; border: 1px solid #E4DFD6; text-align: left;">
          <div style="color: #1A1813; font-size: 16px; font-weight: 700; margin-bottom: 10px;">Here's what BureauOS offers you right now:</div>
          <ul style="margin: 0; padding: 0; list-style: none;">
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Orin-generated governance checklists for Nigerian-registered businesses
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Early access to structuring templates (shareholder agreements, board resolutions)
            </li>
            <li style="display: flex; align-items: flex-start; gap: 8px; color: #524D44; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              <span style="display: inline-block; width: 6px; height: 6px; min-width: 6px; background: #2C5378; border-radius: 50%; margin-top: 7px;"></span>
              Insights on when expanding does make sense, so you can recognize the moment
            </li>
          </ul>
        </div>
        <div style="color: #524D44; font-size: 16px; margin-bottom: 24px; font-weight: 400; line-height: 1.6;">
          <strong>And here's one thing I want you to know:</strong><br/><br/>
          Most founders who said "not yet" come back to us 6-12 months later when their business has traction and they're ready to expand. When that happens, you'll already be in our ecosystem.<br/><br/>
          For now, build well. Structure early.<br/><br/>
          Reply if you want me to send you a simple governance checklist for Nigerian startups.
        </div>
        <div style="color: #524D44; font-size: 16px; font-weight: 600; margin-top: 24px;">
          — Orin
        </div>`,
  },
];

export async function seedEmailManagements(prisma: PrismaClient) {
  for (const template of emailTemplates) {
    const seededTemplate = await prisma.emailTemplate.upsert({
      where: { slug: template.slug },
      update: {
        subject: template.subject,
        title: template.title,
        body: template.body,
      },
      create: template,
    });

    console.log('Email Template Seeded:', seededTemplate.slug);
  }
}
