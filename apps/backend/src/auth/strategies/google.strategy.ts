import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { GoogleOAuthService } from '../services/google-oauth.service';
import { GoogleProfileDto } from '../dto/google-profile.dto';

interface GoogleProfileName {
  givenName?: string;
  familyName?: string;
}

interface GoogleProfilePhotos {
  value?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {
    const clientID = (config.get<string>('google.clientId') || '').trim();
    const clientSecret = (config.get<string>('google.clientSecret') || '').trim();
    const callbackURL = (config.get<string>('google.callbackUrl') || 'https://www.avuno.xyz/api/auth/google/callback').trim();

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      state: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string | undefined,
    profile: any,
  ): Promise<{ sub: string; email: string }> {
    const emails = profile.emails ?? [];
    const primaryEmail = emails.find((e: any) => e.verified) ?? emails[0];
    const name = (profile.name ?? {}) as GoogleProfileName;
    const photos = (profile.photos ?? []) as GoogleProfilePhotos[];

    const dto: GoogleProfileDto = {
      provider: 'google',
      providerAccountId: profile.id,
      email: primaryEmail?.value ?? '',
      emailVerified: Boolean(primaryEmail?.verified),
      accessToken,
      refreshToken,
    };

    if (profile.displayName) {
      dto.displayName = profile.displayName;
    }
    if (name.givenName) {
      dto.firstName = name.givenName;
    }
    if (name.familyName) {
      dto.lastName = name.familyName;
    }
    if (photos[0]?.value) {
      dto.picture = photos[0].value;
    }

    const { user } = await this.googleOAuthService.validateOrCreate(dto);
    return { sub: user.id, email: user.email };
  }
}
