import { Module } from '@nestjs/common';
import { DeploymentHealthService } from './deployment-health.service';
import { EnvironmentValidationService } from './environment-validation.service';
import { ReleaseValidationService } from './release-validation.service';
import { ProductionConfigurationService } from './production-configuration.service';

@Module({
  providers: [
    DeploymentHealthService,
    EnvironmentValidationService,
    ReleaseValidationService,
    ProductionConfigurationService,
  ],
  exports: [
    DeploymentHealthService,
    EnvironmentValidationService,
    ReleaseValidationService,
    ProductionConfigurationService,
  ],
})
export class DeploymentModule {}
