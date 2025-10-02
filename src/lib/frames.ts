import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { FrameData } from '@/types';

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY!,
  baseOptions: {
    headers: {
      "x-neynar-experimental": true,
    },
  },
});

const neynar = new NeynarAPIClient(config);

export async function verifyFrameSignature(frameData: FrameData): Promise<boolean> {
  try {
    const result = await neynar.validateFrameAction(
      frameData.trustedData.messageBytes,
      {
        castId: frameData.untrustedData.castId,
        url: frameData.untrustedData.url,
        messageHash: frameData.untrustedData.messageHash,
        timestamp: frameData.untrustedData.timestamp,
        network: frameData.untrustedData.network,
        buttonIndex: frameData.untrustedData.buttonIndex,
      }
    );
    
    return result.valid;
  } catch (error) {
    console.error('Frame signature verification failed:', error);
    return false;
  }
}

export async function getUserByFid(fid: number) {
  try {
    const user = await neynar.lookupUserByFid(fid);
    return {
      fid: user.result.user.fid,
      username: user.result.user.username,
      displayName: user.result.user.display_name,
      pfpUrl: user.result.user.pfp_url,
    };
  } catch (error) {
    console.error('Failed to fetch user by FID:', error);
    return null;
  }
}

export function generateFrameHtml(
  title: string,
  imageUrl: string,
  buttons: Array<{ label: string; action: string; target?: string }>,
  postUrl?: string
) {
  const buttonTags = buttons
    .map((button, index) => {
      const action = button.action === 'post' ? 'post' : 'link';
      const target = button.target || '';
      return `<meta property="fc:frame:button:${index + 1}" content="${button.label}" />
<meta property="fc:frame:button:${index + 1}:action" content="${action}" />
${target ? `<meta property="fc:frame:button:${index + 1}:target" content="${target}" />` : ''}`;
    })
    .join('\n');

  const postUrlTag = postUrl ? `<meta property="fc:frame:post_url" content="${postUrl}" />` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="${title}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  ${buttonTags}
  ${postUrlTag}
</head>
<body>
  <h1>${title}</h1>
</body>
</html>`;
}
