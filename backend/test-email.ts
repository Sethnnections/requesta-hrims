import * as nodemailer from 'nodemailer';

async function testEmail() {
  console.log('Testing Gmail SMTP connection...');

  // Test option 1: Port 587 with STARTTLS
  const config1 = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: 'patmanseth@gmail.com',
      pass: 'tkmf muci irwt qlnc',
    },
    tls: {
      rejectUnauthorized: false,
    }
  };

  // Test option 2: Port 465 with SSL
  const config2 = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'patmanseth@gmail.com',
      pass: 'tkmf muci irwt qlnc',
    },
    tls: {
      rejectUnauthorized: false,
    }
  };

  const configs = [
    { name: 'Port 587 (STARTTLS)', config: config1 },
    { name: 'Port 465 (SSL)', config: config2 }
  ];

  for (const test of configs) {
    console.log(`\n=== Testing ${test.name} ===`);
    
    try {
      const transporter = nodemailer.createTransport(test.config);
      
      await new Promise((resolve, reject) => {
        transporter.verify((error, success) => {
          if (error) {
            console.error(`❌ ${test.name} failed:`, error.message);
            reject(error);
          } else {
            console.log(`✅ ${test.name} successful:`, success);
            resolve(success);
          }
        });
      });

      // Try sending a test email
      const info = await transporter.sendMail({
        from: '"Test" <patmanseth@gmail.com>',
        to: 'norahchikanda@gmail.com',
        subject: 'Test from NestJS',
        text: 'This is a test email',
      });

      console.log(`📧 Test email sent via ${test.name}:`, info.messageId);
      break; // Stop if one works

    } catch (error) {
      console.error(`Failed with ${test.name}:`, error);
      continue;
    }
  }
}

testEmail().catch(console.error);