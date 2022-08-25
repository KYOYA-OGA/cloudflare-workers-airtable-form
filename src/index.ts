export interface Env {
  AIRTABLE_API_KEY: string;
  AIRTABLE_BASE_ID: string;
  AIRTABLE_TABLE_NAME: string;
  FORM_URL: string;
}

export interface RequestBody {
  fields: {
    Name: string;
    Email: string;
    Phone: string;
    Subject: string;
    Message: string;
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/submit') {
      return submitHandler(request, env);
    }
    return Response.redirect(env.FORM_URL);
  },
};

const submitHandler = async (request: Request, env: Env) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await request.formData();

  const { name, email, phone, subject, message } = Object.fromEntries(body);

  // validation
  if (!name || !email || !subject || !message) {
    return new Response('Missing required fields', { status: 400 });
  }

  const reqBody = {
    fields: {
      Name: name,
      Email: email,
      Phone: phone,
      Subject: subject,
      Message: message,
    },
  } as RequestBody;

  await createAirtableRecord(reqBody, env);

  return Response.redirect(env.FORM_URL);
};

const createAirtableRecord = async (reqBody: RequestBody, env: Env) => {
  return fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}`,
    {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
};
