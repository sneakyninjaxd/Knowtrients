/* ============================================================
   KNOWTRIENTS — mock data
   This is placeholder data standing in for the real database.
   Changes made in the browser (suspend, resolve, reply, delete)
   only last for the current page — there is no backend wired
   up yet, so nothing persists after a refresh or new page load.
   ============================================================ */

const ACCOUNTS = [
  { display_id:"U001", first_name:"Micheal",  last_name:"Afton",   email:"michealA44@gmail.com", role:"User Admin",       is_active:true },
  { display_id:"U002", first_name:"Thomas",   last_name:"Addison",  email:"eddison67@gmail.com",  role:"User Admin",       is_active:false },
  { display_id:"U003", first_name:"Samuel",   last_name:"Liu",       email:"samliu8890@gmail.com", role:"User Admin",       is_active:true },
  { display_id:"U004", first_name:"Lebaski",  last_name:"Addams",    email:"Addamsl1@gmail.com",   role:"User Admin",       is_active:true },
  { display_id:"U010", first_name:"Priya",    last_name:"Nair",      email:"priyanair@gmail.com",  role:"Platform Manager", is_active:true },
  { display_id:"U011", first_name:"Jonas",    last_name:"Wren",      email:"jonaswren@gmail.com",  role:"Platform Manager", is_active:true},
  { display_id:"U020", first_name:"Clare",    last_name:"Koh",       email:"koh234@gmail.com",     role:"User",             is_active:false,
    subscription:{ plan:"Premium Plan", start:"24 August 2026", end:"24 September 2026" } },
  { display_id:"U021", first_name:"Daniel",   last_name:"Tan",       email:"danieltan@gmail.com",  role:"User",             is_active: true,
    subscription:{ plan:"Free Plan", start:"—", end:"—" } },
  { display_id:"U022", first_name:"Farah",    last_name:"Yusof",     email:"farahyusof@gmail.com", role:"User",             is_active:true,
    subscription:{ plan:"Premium Plan", start:"2 July 2026", end:"2 August 2026" } },
  { display_id:"U023", first_name:"Gopal",    last_name:"Reddy",     email:"gopalreddy@gmail.com", role:"User",             is_active:true,
    subscription:{ plan:"Free Plan", start:"—", end:"—" } },
];

const REQUESTS = [
  { id:"R101", display_id:"U020", category:"Clare Koh", subject:"Password Change Request",
    body:"I need help in changing my password. I tried the reset link on the app but it isn't sending me an email.",
    time:"Today 07:44 PM", dateLabel:"9 September 2026", status:"Unresolved", isNew:true,
    attachments:["Image.jpg","Image2.jpg"] },
  { id:"R102", display_id:"U021", category:"Daniel Tan", subject:"Subscription Cancellation Issue",
    body:"My subscription has some issue please help! I was charged twice this month for the premium plan.",
    time:"Yesterday 08:38 AM", dateLabel:"8 September 2026", status:"Unresolved", isNew:false,
    attachments:["Receipt.pdf"] },
  { id:"R103", display_id:"U022", category:"Farah Yusof", subject:"Others – Complaint",
    body:"The nutrient scan result looks incorrect for packaged food — the sodium value shown doesn't match the label on the box.",
    time:"5 September 2026, 02:10 PM", dateLabel:"5 September 2026", status:"Unresolved", isNew:false,
    attachments:[] },
  { id:"R104", display_id:"U023", category:"Gopal Reddy", subject:"Password Change",
    body:"Requesting help resetting my account password, I no longer have access to my old recovery email.",
    time:"1 September 2026, 11:02 AM", dateLabel:"1 September 2026", status:"Resolved", isNew:false,
    attachments:[] },
  { id:"R105", display_id:"U020", category:"Clare Koh", subject:"Others: Inquiries on Premium Plan",
    body:"I would like to ask more about the benefits of the premium plan before I renew — does it include the new recipe planner?",
    time:"21 August 2026 07:44 PM", dateLabel:"21 August 2026", status:"Resolved", isNew:false,
    attachments:["Screenshot.png","Screenshot2.png"] },
  { id:"R106", display_id:"U022", category:"Farah Yusof", subject:"Subscription Cancellation",
    body:"Please cancel my subscription renewal, I don't plan on continuing after this cycle ends.",
    time:"30 August 2026, 09:00 AM", dateLabel:"30 August 2026", status:"Resolved", isNew:false,
    attachments:[] },
  { id:"R107", display_id:"U023", category:"Gopal Reddy", subject:"Password Change",
    body:"Locked out of my account after too many attempts, please help reset it.",
    time:"24 August 2026, 06:15 PM", dateLabel:"24 August 2026", status:"Resolved", isNew:false,
    attachments:[] },
  { id:"R108", display_id:"U021", category:"Daniel Tan", subject:"Others – Inquiries",
    body:"Is there a way to export my nutrient logs to a spreadsheet? I'd like to share them with my dietitian.",
    created_at:"19 August 2026, 04:20 PM", dateLabel:"19 August 2026", status:"Resolved", isNew:false,
    attachments:[] },
];

function getAccountById(id){ return ACCOUNTS.find(a => a.id === id); }
function getRequestsForUser(id){ return REQUESTS.filter(r => r.userId === id); }
function getRequestById(id){ return REQUESTS.find(r => r.id === id); }