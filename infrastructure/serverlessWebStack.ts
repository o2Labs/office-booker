import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awslambda from 'aws-lambda';
import { URL } from 'url';
import * as crypto from 'crypto';

type Readwrite<T> = {
  -readonly [P in keyof T]: T[P];
};
export type ServerlessWebStackDnsArgs = {
  /**
   * Name of the zone your domain will be added to.
   * Note this should end with a training '.'.
   * E.g. `test.com.`
   */
  zoneName: string;
  /**
   * The domain name where you will host your application. E.g. `subdomain.test.com`
   */
  domainName: string;
};
export type DistributionGeoRestrictions = {
  restrictionType: pulumi.Input<'whitelist' | 'blacklist'>;
  locations: pulumi.Input<pulumi.Input<string>[]>;
};
export type CdnLogs = {
  /**
   * Enable writing CDN access logs to an S3 bucket
   * @default true
   */
  readonly enabled?: boolean;
  /**
   * Number of days after which CDN log S3 objects should be discarded. Undefined = never.
   */
  readonly expiryDays?: number;
  /**
   * Default encryption to be applied to the static site and CDN logs buckets.
   * Defaults to not encrypted. Specifying 'true' will use AES256 with the default account key.
   */
  readonly encryption?:
    | boolean
    | pulumi.Input<aws.types.input.s3.BucketServerSideEncryptionConfiguration>;
  /**
   * Specifies whether you want CloudFront to
   * include cookies in access logs
   * @default false
   */
  includeCookies?: pulumi.Input<boolean>;
};
export type ApiEventHandler = aws.lambda.EventHandler<
  awslambda.APIGatewayProxyEvent,
  awslambda.APIGatewayProxyResult
>;
type S3Encryption =
  | boolean
  | pulumi.Input<aws.types.input.s3.BucketServerSideEncryptionConfiguration>;
export type ServerlessWebStackArgs = {
  /**
   * An EventHandler is either a JavaScript callback or an aws.lambda.Function that can be used to
   * handle an event triggered by some resource.  If just a JavaScript callback is provided the AWS
   * Lambda will be created by calling [createCallbackFunction] on it.  If more control over the
   * resultant AWS Lambda is required, clients can call [createCallbackFunction] directly and pass the
   * result of that to any code that needs an EventHandler.
   */
  readonly apiEventHandler: ApiEventHandler;
  /**
   * Pattern used to route requests to the API event handler. Default: `api/*`
   */
  readonly apiPathPattern?: pulumi.Input<string>;
  /**
   * One or more custom error response elements (multiples allowed).
   * This can be useful for single page apps with client-side routing.
   * @example
   * ```typescript
   * customErrorResponses: [
   *   { errorCode: 404, responseCode: 200, responsePagePath: "/index.html" }
   * ],
   * ```
   */
  readonly customErrorResponses?: pulumi.Input<
    pulumi.Input<aws.types.input.cloudfront.DistributionCustomErrorResponse>[]
  >;
  /**
   * Specify to host your application on a custom domain.
   * This will create the required DNS records and ACM certificates.
   */
  readonly customDns?: ServerlessWebStackDnsArgs;
  /**
   * The object that you want CloudFront to
   * return (for example, index.html) when an end user requests the root URL.
   * @default index.html
   */
  readonly defaultRootObject?: pulumi.Input<string>;
  /**
   * Default encryption to be applied to the static site.
   * Defaults to not encrypted. Specifying 'true' will use AES256 with the default account key.
   */
  readonly s3DefaultEncryption?: S3Encryption;
  /**
   * Number of days after which CDN log S3 objects should be discarded. Undefined = never.
   */
  readonly cdnLogs?: CdnLogs;
  /**
   * The price class for this distribution. One of
   * `PriceClass_All`, `PriceClass_200`, `PriceClass_100`
   *
   * @default `PriceClass_100`
   */
  readonly cdnPriceClass?: `PriceClass_All` | `PriceClass_200` | `PriceClass_100`;
  /**
   * Use this element to specify the
   * protocol that users can use to access the files in the origin specified by
   * TargetOriginId when a request matches the path pattern in PathPattern. One
   * of `allow-all`, `https-only`, or `redirect-to-https`.
   *
   * @default redirect-to-https
   */
  readonly viewerProtocolPolicy?: `allow-all` | `https-only` | `redirect-to-https`;
  /**
   * Controls whether CloudFront caches the
   * response to requests using the specified HTTP methods.
   *
   * @default ["GET", "HEAD", "OPTIONS"]
   */
  readonly cachedMethods?: pulumi.Input<pulumi.Input<string>[]>;
  /**
   * Whether you want CloudFront to automatically
   * compress content for web requests that include `Accept-Encoding: gzip` in
   * the request header
   *
   * @default false
   */
  readonly compress?: pulumi.Input<boolean>;
  /**
   * The default amount of time (in seconds) that an
   * object is in a CloudFront cache before CloudFront forwards another request
   * in the absence of an `Cache-Control max-age` or `Expires` header.
   *
   * @default 86,400 (1 day)
   */
  readonly defaultTtl?: pulumi.Input<number>;
  /**
   * The maximum amount of time (in seconds) that an
   * object is in a CloudFront cache before CloudFront forwards another request
   * to your origin to determine whether the object has been updated. Only
   * effective in the presence of `Cache-Control max-age`, `Cache-Control
   * s-maxage`, and `Expires` headers. Defaults to 365 days.
   */
  readonly maxTtl?: pulumi.Input<number>;
  /**
   * The minimum amount of time that you want objects to
   * stay in CloudFront caches before CloudFront queries your origin to see
   * whether the object has been updated. Defaults to 0 seconds.
   */
  readonly minTtl?: pulumi.Input<number>;
  /**
   * If you're using AWS WAF to filter CloudFront
   * requests, the Id of the AWS WAF web ACL that is associated with the
   * distribution. The WAF Web ACL must exist in the WAF Global (CloudFront)
   * region and the credentials configuring this argument must have
   * `waf:GetWebACL` permissions assigned.
   */
  readonly webAclId?: pulumi.Input<string>;
  /**
   * The restriction configuration for this distribution
   */
  readonly distributionGeoRestrictions?: pulumi.Input<DistributionGeoRestrictions>;
  /**
   * The set of arguments for constructing a RestApi resource.
   */
  readonly restApi?: Omit<
    aws.apigateway.RestApiArgs,
    'name' | 'body' | 'tags' | 'endpointConfiguration'
  >;
  /**
   * A mapping of tags that identifies subset of objects to which the rule applies.
   * The rule applies only to objects having all the tags in its tagset.
   */
  readonly tags?: pulumi.Input<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }>;
};

function sha1hash(s: string): string {
  const shasum: crypto.Hash = crypto.createHash('sha1');
  shasum.update(s);
  return shasum.digest('hex');
}

const getS3Encryption = (
  args?: S3Encryption
): pulumi.Input<aws.types.input.s3.BucketServerSideEncryptionConfiguration> | undefined => {
  if (!args) {
    return undefined;
  }
  if (args === true) {
    return {
      rule: {
        applyServerSideEncryptionByDefault: {
          sseAlgorithm: 'AES256',
        },
      },
    };
  }
  return args;
};

export class ServerlessWebStack extends pulumi.ComponentResource {
  staticSiteBucket: aws.s3.Bucket;
  cdn: aws.cloudfront.Distribution;
  apiFunction: aws.lambda.Function;
  restApi: aws.apigateway.RestApi;
  deployment: aws.apigateway.Deployment;
  stage: aws.apigateway.Stage;
  url: pulumi.Output<string>;
  constructor(name: string, args: ServerlessWebStackArgs, opts?: pulumi.ComponentResourceOptions) {
    super('telefonica:o2Labs:ServerlessWebStack', name, args, opts);

    const prefix = (resource: string) => `${name}-${resource}`;

    this.staticSiteBucket = new aws.s3.Bucket(
      prefix(`static-site`),
      {
        serverSideEncryptionConfiguration: getS3Encryption(args.s3DefaultEncryption),
        tags: args.tags,
      },
      { parent: this }
    );

    const accessBlock = new aws.s3.BucketPublicAccessBlock(
      prefix(`static-site-privacy`),
      {
        bucket: this.staticSiteBucket.bucket,
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
      { parent: this }
    );

    const cdnAccessIdentity = new aws.cloudfront.OriginAccessIdentity(
      prefix(`static-site-identity`),
      {
        comment: prefix(`static-site-identity`),
      },
      { parent: this }
    );

    new aws.s3.BucketPolicy(
      prefix(`static-site-policy`),
      {
        bucket: this.staticSiteBucket.bucket,
        policy: pulumi
          .all({
            s3CanonicalUserId: cdnAccessIdentity.s3CanonicalUserId,
            staticSiteBucketArn: this.staticSiteBucket.arn,
          })
          .apply(({ s3CanonicalUserId, staticSiteBucketArn }) =>
            JSON.stringify({
              Version: '2012-10-17',
              Statement: [
                {
                  Sid: 'Grant a CloudFront Origin Identity access to get private content',
                  Effect: 'Allow',
                  Principal: { CanonicalUser: s3CanonicalUserId },
                  Action: 's3:GetObject',
                  Resource: `${staticSiteBucketArn}/*`,
                },
                {
                  Sid: 'Grant a CloudFront Origin Identity access to list private content',
                  Effect: 'Allow',
                  Principal: { CanonicalUser: s3CanonicalUserId },
                  Action: 's3:ListBucket',
                  Resource: staticSiteBucketArn,
                },
              ],
            })
          ),
      },
      { parent: this, dependsOn: accessBlock }
    );

    function swaggerSpec(lambdaArn: string): string {
      const swaggerSpec = {
        swagger: '2.0',
        info: { title: 'api', version: '1.0' },
        paths: {
          '/': swaggerRouteHandler(lambdaArn),
          '/{proxy+}': swaggerRouteHandler(lambdaArn),
        },
      };
      return JSON.stringify(swaggerSpec);
    }

    // Create a single Swagger spec route handler for a Lambda function.
    function swaggerRouteHandler(lambdaArn: string) {
      const region = aws.config.requireRegion();
      return {
        'x-amazon-apigateway-any-method': {
          'x-amazon-apigateway-integration': {
            uri: `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`,
            passthroughBehavior: 'when_no_match',
            httpMethod: 'POST',
            type: 'aws_proxy',
          },
        },
      };
    }

    this.apiFunction = aws.lambda.createFunctionFromEventHandler(
      prefix('api-handler'),
      args.apiEventHandler,
      { parent: this }
    );

    // Create the API Gateway Rest API, using a swagger spec.
    this.restApi = new aws.apigateway.RestApi(
      prefix('api'),
      {
        ...args.restApi,
        body: this.apiFunction.arn.apply((lambdaArn) => swaggerSpec(lambdaArn)),
        tags: args.tags,
      },
      { parent: this }
    );

    // Create a deployment of the Rest API.
    this.deployment = new aws.apigateway.Deployment(
      prefix('api-deployment'),
      {
        restApi: this.restApi,
        // Note: Set to empty to avoid creating an implicit stage, we'll create it explicitly below instead.
        stageName: '',
        variables: {
          version: pulumi
            .all([
              this.apiFunction.arn,
              args.restApi?.apiKeySource,
              args.restApi?.binaryMediaTypes,
              args.restApi?.minimumCompressionSize,
              args.restApi?.policy,
            ])
            .apply(JSON.stringify)
            .apply(sha1hash),
        },
      },
      { parent: this }
    );

    // Create a stage, which is an addressable instance of the Rest API. Set it to point at the latest deployment.
    this.stage = new aws.apigateway.Stage(
      prefix('api-stage'),
      {
        restApi: this.restApi,
        deployment: this.deployment,
        stageName: 'stage',
        tags: args.tags,
      },
      { parent: this }
    );

    new aws.lambda.Permission(
      prefix('api-handler-permission'),
      {
        action: 'lambda:invokeFunction',
        function: this.apiFunction,
        principal: 'apigateway.amazonaws.com',
        sourceArn: pulumi.interpolate`${this.deployment.executionArn}*/*`,
      },
      { parent: this }
    );

    const cdnArgs: Readwrite<aws.cloudfront.DistributionArgs> = {
      enabled: true,
      waitForDeployment: false,
      origins: [
        {
          originId: 'static-site',
          domainName: this.staticSiteBucket.bucketDomainName,
          s3OriginConfig: {
            originAccessIdentity: cdnAccessIdentity.cloudfrontAccessIdentityPath,
          },
        },
        {
          originId: 'api',
          domainName: this.deployment.invokeUrl.apply((url) => new URL(url).hostname),
          originPath: this.stage.stageName.apply((name) => '/' + name),
          customOriginConfig: {
            originProtocolPolicy: 'https-only',
            httpPort: 80,
            httpsPort: 443,
            originSslProtocols: ['TLSv1.2'],
          },
        },
      ],
      defaultRootObject: args.defaultRootObject || 'index.html',
      defaultCacheBehavior: {
        targetOriginId: 'static-site',
        viewerProtocolPolicy: args.viewerProtocolPolicy || 'redirect-to-https',
        allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
        cachedMethods: args.cachedMethods || ['GET', 'HEAD', 'OPTIONS'],
        forwardedValues: {
          cookies: { forward: 'none' },
          queryString: false,
        },
        compress: args.compress,
        minTtl: args.minTtl,
        defaultTtl: args.defaultTtl,
        maxTtl: args.maxTtl,
      },
      orderedCacheBehaviors: [
        {
          pathPattern: args.apiPathPattern || 'api/*',
          targetOriginId: 'api',
          viewerProtocolPolicy: args.viewerProtocolPolicy || 'redirect-to-https',
          allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE'],
          lambdaFunctionAssociations: [],
          cachedMethods: args.cachedMethods || ['GET', 'HEAD', 'OPTIONS'],
          forwardedValues: {
            cookies: { forward: 'all' },
            queryString: true,
            headers: ['Authorization'],
          },
          compress: args.compress,
          minTtl: 0,
          defaultTtl: 0,
          maxTtl: args.maxTtl,
        },
      ],
      // "All" is the most broad distribution, and also the most expensive.
      // "100" is the least broad, and also the least expensive.
      priceClass: 'PriceClass_100',
      customErrorResponses: args.customErrorResponses,
      restrictions: {
        geoRestriction: args.distributionGeoRestrictions || {
          restrictionType: 'none',
        },
      },
      viewerCertificate: {
        cloudfrontDefaultCertificate: true,
      },
      webAclId: args.webAclId,
      tags: args.tags,
    };

    if (args.cdnLogs && !!args.cdnLogs.enabled) {
      const cdnLogsBucket = new aws.s3.Bucket(
        prefix(`cdn-logs`),
        {
          acl: 'private',
          tags: args.tags,
          serverSideEncryptionConfiguration: getS3Encryption(args.cdnLogs.encryption),
          lifecycleRules: args.cdnLogs.expiryDays
            ? [
                {
                  enabled: true,
                  expiration: { days: args.cdnLogs.expiryDays },
                },
              ]
            : undefined,
        },
        { parent: this }
      );

      new aws.s3.BucketPublicAccessBlock(
        prefix(`cdn-logs-privacy`),
        {
          bucket: cdnLogsBucket.bucket,
          blockPublicAcls: true,
          blockPublicPolicy: true,
          ignorePublicAcls: true,
          restrictPublicBuckets: true,
        },
        { parent: this }
      );

      cdnArgs.loggingConfig = {
        bucket: cdnLogsBucket.bucketDomainName,
        includeCookies: args.cdnLogs.includeCookies,
      };
    }

    if (args.customDns) {
      const routingZone = aws.route53.getZone({
        name: args.customDns.zoneName,
      });

      const usEast1Provider = new aws.Provider(
        prefix(`aws-us-east-1-provider`),
        {
          region: 'us-east-1',
        },
        { parent: this }
      );

      const cert = new aws.acm.Certificate(
        prefix(`certificate`),
        {
          domainName: args.customDns.domainName,
          validationMethod: 'DNS',
          tags: { ...args.tags, Name: prefix(`acm-cert`) },
        },
        { provider: usEast1Provider, parent: this }
      );

      const certValidationRecord = new aws.route53.Record(
        prefix(`certificate-dns-validation-record`),
        {
          name: cert.domainValidationOptions[0].resourceRecordName,
          records: [cert.domainValidationOptions[0].resourceRecordValue],
          ttl: 60,
          type: cert.domainValidationOptions[0].resourceRecordType,
          zoneId: routingZone.then((z) => z.id),
        },
        { parent: this }
      );

      const certValidation = new aws.acm.CertificateValidation(
        prefix(`certificate-validation`),
        {
          certificateArn: cert.arn,
          validationRecordFqdns: [certValidationRecord.fqdn],
        },
        { provider: usEast1Provider, parent: this }
      );

      this.cdn = new aws.cloudfront.Distribution(
        prefix(`cdn`),
        {
          ...cdnArgs,
          aliases: [args.customDns.domainName],
          viewerCertificate: {
            cloudfrontDefaultCertificate: false,
            acmCertificateArn: certValidation.certificateArn,
            sslSupportMethod: 'sni-only',
          },
        },
        { parent: this }
      );

      new aws.route53.Record(
        prefix(`dns-record`),
        {
          zoneId: routingZone.then((z) => z.id),
          type: 'A',
          name: `${args.customDns.domainName}.`,
          aliases: [
            {
              name: this.cdn.domainName,
              zoneId: this.cdn.hostedZoneId,
              evaluateTargetHealth: false,
            },
          ],
        },
        { parent: this }
      );
      this.url = pulumi.output(`https://${args.customDns.domainName}/`);
    } else {
      this.cdn = new aws.cloudfront.Distribution(prefix(`cdn`), cdnArgs, {
        parent: this,
      });
      this.url = this.cdn.domainName.apply((domain) => `https://${domain}/`);
    }
    this.registerOutputs({
      apiFunction: this.apiFunction,
      deployment: this.deployment,
      restApi: this.restApi,
      stage: this.stage,
      cdn: this.cdn,
      staticSiteBucket: this.staticSiteBucket,
      url: this.url,
    });
  }
}
