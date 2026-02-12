#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0nMCP - CLI
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Usage:
 *   npx 0nmcp              Start MCP server (stdio)
 *   npx 0nmcp init         Initialize ~/.0n directory
 *   npx 0nmcp connect      Interactive connection setup
 *   npx 0nmcp list         List connected services
 *   npx 0nmcp migrate      Migrate from ~/.0nmcp to ~/.0n
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Colors
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const BANNER = `
${c.cyan}${c.bright}
   ██████╗ ███╗   ██╗███╗   ███╗ ██████╗██████╗ 
  ██╔═████╗████╗  ██║████╗ ████║██╔════╝██╔══██╗
  ██║██╔██║██╔██╗ ██║██╔████╔██║██║     ██████╔╝
  ████╔╝██║██║╚██╗██║██║╚██╔╝██║██║     ██╔═══╝ 
  ╚██████╔╝██║ ╚████║██║ ╚═╝ ██║╚██████╗██║     
   ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝╚═╝     
${c.reset}
  ${c.bright}Universal AI API Orchestrator${c.reset}
  ${c.cyan}Connect your apps. Say what you want. AI does the rest.${c.reset}
  
  ${c.yellow}https://0nmcp.com${c.reset} | ${c.yellow}https://0nork.com${c.reset}
`;

const DOT_ON_DIR = path.join(os.homedir(), '.0n');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // No args = start MCP server
  if (!command) {
    // Import and run the server
    await import('./index.js');
    return;
  }

  // Help
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(BANNER);
    console.log(`
${c.bright}Usage:${c.reset}

  ${c.cyan}npx 0nmcp${c.reset}              Start MCP server (for Claude Desktop)
  ${c.cyan}npx 0nmcp init${c.reset}         Initialize ~/.0n directory
  ${c.cyan}npx 0nmcp connect${c.reset}      Interactive connection setup
  ${c.cyan}npx 0nmcp list${c.reset}         List connected services
  ${c.cyan}npx 0nmcp migrate${c.reset}      Migrate from ~/.0nmcp to ~/.0n

${c.bright}Configure Claude Desktop:${c.reset}

  Add to your claude_desktop_config.json:

  {
    "mcpServers": {
      "0nmcp": {
        "command": "npx",
        "args": ["-y", "0nmcp"]
      }
    }
  }

${c.bright}Links:${c.reset}

  Documentation: ${c.yellow}https://0nmcp.com/docs${c.reset}
  GitHub:        ${c.yellow}https://github.com/0nork/0nmcp${c.reset}
  Discord:       ${c.yellow}https://discord.gg/0nmcp${c.reset}
`);
    return;
  }

  // Init
  if (command === 'init') {
    console.log(BANNER);
    initDotOn();
    return;
  }

  // List
  if (command === 'list') {
    console.log(BANNER);
    await listConnections();
    return;
  }

  // Connect
  if (command === 'connect') {
    console.log(BANNER);
    await interactiveConnect();
    return;
  }

  // Migrate
  if (command === 'migrate') {
    console.log(BANNER);
    const { migrateLegacy } = await import('./connections.js');
    const result = await migrateLegacy();
    console.log(result);
    return;
  }

  // Unknown command
  console.log(`${c.red}Unknown command: ${command}${c.reset}`);
  console.log(`Run ${c.cyan}npx 0nmcp help${c.reset} for usage`);
  process.exit(1);
}

function initDotOn() {
  const dirs = [
    DOT_ON_DIR,
    path.join(DOT_ON_DIR, 'connections'),
    path.join(DOT_ON_DIR, 'workflows'),
    path.join(DOT_ON_DIR, 'snapshots'),
    path.join(DOT_ON_DIR, 'history'),
    path.join(DOT_ON_DIR, 'cache'),
  ];

  console.log(`${c.bright}Initializing ~/.0n directory...${c.reset}\n`);

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`${c.green}✓${c.reset} Created ${dir}`);
    } else {
      console.log(`${c.blue}○${c.reset} Exists ${dir}`);
    }
  }

  // Create default config
  const configPath = path.join(DOT_ON_DIR, 'config.json');
  if (!fs.existsSync(configPath)) {
    const config = {
      "$0n": {
        type: "config",
        version: "1.0.0",
        created: new Date().toISOString(),
      },
      settings: {
        ai_provider: "anthropic",
        fallback_mode: "keyword",
        history_enabled: true,
        cache_enabled: true,
      },
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`${c.green}✓${c.reset} Created config.json`);
  }

  console.log(`
${c.green}${c.bright}~/.0n initialized!${c.reset}

${c.bright}Next steps:${c.reset}

  1. Connect a service:
     ${c.cyan}npx 0nmcp connect${c.reset}

  2. Configure Claude Desktop:
     Add to claude_desktop_config.json:
     
     ${c.yellow}{
       "mcpServers": {
         "0nmcp": {
           "command": "npx",
           "args": ["-y", "0nmcp"]
         }
       }
     }${c.reset}

  3. Restart Claude Desktop and start orchestrating!
`);
}

async function listConnections() {
  const connectionsDir = path.join(DOT_ON_DIR, 'connections');
  
  if (!fs.existsSync(connectionsDir)) {
    console.log(`${c.yellow}No connections found.${c.reset}`);
    console.log(`Run ${c.cyan}npx 0nmcp connect${c.reset} to add one.`);
    return;
  }

  const files = fs.readdirSync(connectionsDir).filter(f => f.endsWith('.0n'));
  
  if (files.length === 0) {
    console.log(`${c.yellow}No connections found.${c.reset}`);
    console.log(`Run ${c.cyan}npx 0nmcp connect${c.reset} to add one.`);
    return;
  }

  console.log(`${c.bright}Connected Services:${c.reset}\n`);

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(connectionsDir, file), 'utf8'));
      console.log(`  ${c.green}●${c.reset} ${c.bright}${data.$0n?.name || data.service}${c.reset}`);
      console.log(`    Service: ${data.service}`);
      console.log(`    File: ${file}`);
      console.log('');
    } catch (e) {
      console.log(`  ${c.red}●${c.reset} ${file} (error reading)`);
    }
  }
}

async function interactiveConnect() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q) => new Promise(resolve => rl.question(q, resolve));

  console.log(`${c.bright}Connect a new service${c.reset}\n`);

  const services = [
    'stripe', 'slack', 'discord', 'twilio', 'sendgrid', 'resend',
    'openai', 'anthropic', 'airtable', 'notion', 'supabase',
    'github', 'linear', 'shopify', 'hubspot', 'calendly', 'crm',
  ];

  console.log('Available services:');
  services.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  console.log('');

  const serviceInput = await ask('Enter service name or number: ');
  let service = serviceInput;
  
  const num = parseInt(serviceInput);
  if (!isNaN(num) && num >= 1 && num <= services.length) {
    service = services[num - 1];
  }

  if (!services.includes(service)) {
    console.log(`${c.yellow}Custom service: ${service}${c.reset}`);
  }

  console.log(`\nConnecting to ${c.cyan}${service}${c.reset}\n`);

  // Get credentials based on service
  const creds = {};
  
  if (['stripe', 'openai', 'anthropic', 'sendgrid', 'resend', 'airtable', 'notion', 'calendly'].includes(service)) {
    creds.api_key = await ask('API Key: ');
  } else if (service === 'slack' || service === 'discord') {
    creds.botToken = await ask('Bot Token: ');
  } else if (service === 'twilio') {
    creds.accountSid = await ask('Account SID: ');
    creds.authToken = await ask('Auth Token: ');
  } else if (service === 'github') {
    creds.token = await ask('Personal Access Token: ');
  } else if (service === 'crm') {
    creds.access_token = await ask('Access Token: ');
    creds.locationId = await ask('Location ID: ');
  } else if (service === 'supabase') {
    creds.url = await ask('Supabase URL: ');
    creds.anonKey = await ask('Anon Key: ');
  } else {
    creds.api_key = await ask('API Key/Token: ');
  }

  const name = await ask(`Connection name (default: ${service}): `) || service;

  rl.close();

  // Save connection
  const connection = {
    "$0n": {
      type: "connection",
      version: "1.0.0",
      created: new Date().toISOString(),
      name: name,
    },
    service: service,
    environment: "production",
    auth: {
      type: "api_key",
      credentials: creds,
    },
    metadata: {
      connected_at: new Date().toISOString(),
      connected_by: "0nmcp-cli",
    },
  };

  const connectionsDir = path.join(DOT_ON_DIR, 'connections');
  if (!fs.existsSync(connectionsDir)) {
    fs.mkdirSync(connectionsDir, { recursive: true });
  }

  const filePath = path.join(connectionsDir, `${service}.0n`);
  fs.writeFileSync(filePath, JSON.stringify(connection, null, 2));

  console.log(`\n${c.green}✓${c.reset} Connected to ${c.bright}${service}${c.reset}`);
  console.log(`  Saved to: ${filePath}`);
}

main().catch(console.error);
