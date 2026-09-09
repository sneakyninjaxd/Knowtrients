/* ============================================================
   KNOWTRIENTS — mock data
   This is placeholder data standing in for the real database.
   Changes made in the browser (suspend, resolve, reply, delete)
   only last for the current page — there is no backend wired
   up yet, so nothing persists after a refresh or new page load.
   ============================================================ */

const ACCOUNTS = [
  { id:"U001", firstName:"Micheal",  lastName:"Afton",   email:"michealA44@gmail.com", type:"User Admin",       status:"Active" },
  { id:"U002", firstName:"Thomas",   lastName:"Addison",  email:"eddison67@gmail.com",  type:"User Admin",       status:"Suspended" },
  { id:"U003", firstName:"Samuel",   lastName:"Liu",       email:"samliu8890@gmail.com", type:"User Admin",       status:"Active" },
  { id:"U004", firstName:"Lebaski",  lastName:"Addams",    email:"Addamsl1@gmail.com",   type:"User Admin",       status:"Active" },
  { id:"U010", firstName:"Priya",    lastName:"Nair",      email:"priyanair@gmail.com",  type:"Platform Manager", status:"Active" },
  { id:"U011", firstName:"Jonas",    lastName:"Wren",      email:"jonaswren@gmail.com",  type:"Platform Manager", status:"Active" },
  { id:"U020", firstName:"Clare",    lastName:"Koh",       email:"koh234@gmail.com",     type:"User",             status:"Suspended",
    subscription:{ plan:"Premium Plan", start:"24 August 2026", end:"24 September 2026" } },
  { id:"U021", firstName:"Daniel",   lastName:"Tan",       email:"danieltan@gmail.com",  type:"User",             status:"Active",
    subscription:{ plan:"Free Plan", start:"—", end:"—" } },
  { id:"U022", firstName:"Farah",    lastName:"Yusof",     email:"farahyusof@gmail.com", type:"User",             status:"Active",
    subscription:{ plan:"Premium Plan", start:"2 July 2026", end:"2 August 2026" } },
  { id:"U023", firstName:"Gopal",    lastName:"Reddy",     email:"gopalreddy@gmail.com", type:"User",             status:"Active",
    subscription:{ plan:"Free Plan", start:"—", end:"—" } },
];

const REQUESTS = [
  { id:"R101", userId:"U020", name:"Clare Koh", subject:"Password Change Request",
    preview:"I need help in changing my password.",
    body:"I need help in changing my password. I tried the reset link on the app but it isn't sending me an email.",
    time:"Today 07:44 PM", dateLabel:"9 September 2026", status:"Unresolved", isNew:true,
    attachments:["Image.jpg","Image2.jpg"] },
  { id:"R102", userId:"U021", name:"Daniel Tan", subject:"Subscription Cancellation Issue",
    preview:"My subscriptions has some issue please help!",
    body:"My subscription has some issue please help! I was charged twice this month for the premium plan.",
    time:"Yesterday 08:38 AM", dateLabel:"8 September 2026", status:"Unresolved", isNew:false,
    attachments:["Receipt.pdf"] },
  { id:"R103", userId:"U022", name:"Farah Yusof", subject:"Others – Complaint",
    preview:"The nutrient scan result looks incorrect for packaged food.",
    body:"The nutrient scan result looks incorrect for packaged food — the sodium value shown doesn't match the label on the box.",
    time:"5 September 2026, 02:10 PM", dateLabel:"5 September 2026", status:"Unresolved", isNew:false,
    attachments:[] },
  { id:"R104", userId:"U023", name:"Gopal Reddy", subject:"Password Change",
    preview:"Requesting help resetting my account password.",
    body:"Requesting help resetting my account password, I no longer have access to my old recovery email.",
    time:"1 September 2026, 11:02 AM", dateLabel:"1 September 2026", status:"Resolved", isNew:false,
    attachments:[] },
  { id:"R105", userId:"U020", name:"Clare Koh", subject:"Others: Inquiries on Premium Plan",
    preview:"I would like to ask more about the benefits of ...",
    body:"I would like to ask more about the benefits of the premium plan before I renew — does it include the new recipe planner?",
    time:"21 August 2026 07:44 PM", dateLabel:"21 August 2026", status:"Resolved", isNew:false,
    attachments:["Screenshot.png","Screenshot2.png"] },
  { id:"R106", userId:"U022", name:"Farah Yusof", subject:"Subscription Cancellation",
    preview:"Please cancel my subscription renewal.",
    body:"Please cancel my subscription renewal, I don't plan on continuing after this cycle ends.",
    time:"30 August 2026, 09:00 AM", dateLabel:"30 August 2026", status:"Resolved", isNew:false,
    attachments:[] },
  { id:"R107", userId:"U023", name:"Gopal Reddy", subject:"Password Change",
    preview:"Locked out of my account after too many attempts.",
    body:"Locked out of my account after too many attempts, please help reset it.",
    time:"24 August 2026, 06:15 PM", dateLabel:"24 August 2026", status:"Resolved", isNew:false,
    attachments:[] },
  { id:"R108", userId:"U021", name:"Daniel Tan", subject:"Others – Inquiries",
    preview:"Is there a way to export my nutrient logs?",
    body:"Is there a way to export my nutrient logs to a spreadsheet? I'd like to share them with my dietitian.",
    time:"19 August 2026, 04:20 PM", dateLabel:"19 August 2026", status:"Resolved", isNew:false,
    attachments:[] },
];

function getAccountById(id){ return ACCOUNTS.find(a => a.id === id); }
function getRequestsForUser(id){ return REQUESTS.filter(r => r.userId === id); }
function getRequestById(id){ return REQUESTS.find(r => r.id === id); }