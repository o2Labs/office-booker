const splitCode = (code: string): string =>
  code
    .split('')
    .map((c) => `<span>${c}</span>`)
    .join('');

export const verifyHTML = (
  domainName: string,
  code: string
) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="format-detection" content="telephone=no" />
    <title>Office Booker</title>

    <!-- STYLES -->
    <style type="text/css">
      /* RESETS */
      #outlook a {
        padding: 0;
      }

      .ExternalClass {
        width: 100%;
      }

      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }

      p {
        margin: 0;
        padding: 0;
        font-size: 0px;
        line-height: 0px;
      }

      img {
        -ms-interpolation-mode: bicubic;
      }

      table td {
        border-collapse: collapse;
      }

      table {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      /* MOBILE ONLY */
      @media only screen and (max-width: 599px) {
        table {
          width: 100% !important;
        }

        /* Header */
        .rwd-logo-width {
          width: 35px !important;
        }

        .rwd-logo {
          width: 22px !important;
          height: 24px !important;
        }

        .rwd-lab-logo-width {
          width: 38px !important;
        }

        .rwd-lab-logo {
          width: 22px !important;
          height: 24px !important;
        }

        .rwd-header {
          font-size: 22px !important;
          line-height: 22px !important;
        }

        /* General */
        .rwd-padding {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }

        .rwd-hide {
          display: none !important;
        }

        .rwd-fixed {
          display: inline-block !important;
          width: auto !important;
        }
      }
    </style>

    <!--[if mso]>
      <style>
        body,
        table tr,
        table td,
        table th,
        a,
        span,
        table.MsoNormalTable {
          font-family: sans-serif !important;
        }
      </style>
    <![endif]-->

    <!-- OUTLOOK DPI -->
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
  </head>

  <body
    style="
      width: 100%;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background: #ffffff;
    "
  >
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="margin: 0; padding: 0; width: 100%; line-height: 100% !important; background: #ffffff;"
    >
      <tr>
        <td align="center" valign="top">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            align="center"
            style="width: 600px; background: #ffffff;"
          >
            <tr>
              <td
                bgcolor="#1d63ac"
                width="600"
                valign="top"
              >
                <!--[if gte mso 9]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;">
                  <v:fill type="tile" color="#1d63ac" />
                  <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                <![endif]-->
                <div>
                  <table
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    align="left"
                    style="width: 600px;"
                  >
                    <tr>
                      <td align="left" valign="top" style="padding: 16px 20px;">
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          border="0"
                          align="left"
                          style="width: 100%;"
                        >
                          <tr>
                            <td align="left" valign="middle" width="42" class="rwd-logo-width">
                              <a href="https://${domainName}/">
                                <img
                                  src="https://${domainName}/images/email/logo.png"
                                  alt="Office Booker Logo"
                                  width="27"
                                  height="30"
                                  style="border: 0; display: block;"
                                  class="rwd-logo"
                                />
                              </a>
                            </td>
                            <td
                              align="left"
                              valign="middle"
                              style="
                                font-family: Verdana, Arial, sans-serif;
                                font-size: 24px;
                                line-height: 24px;
                                font-weight: 500;
                                color: #ffffff;
                              "
                              class="rwd-header"
                            >
                              Office Booker
                            </td>
                            <td align="right" valign="middle" width="46" class="rwd-lab-logo-width">
                              <a href="https://github.com/o2Labs/">
                                <img
                                  src="https://${domainName}/images/email/lab-logo.png"
                                  alt="The Lab logo"
                                  width="31"
                                  height="30"
                                  style="border: 0; display: block;"
                                  class="rwd-lab-logo"
                                />
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
                <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!-- END HEADER -->

    <!-- CODE -->
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="margin: 0; padding: 0; width: 100%; line-height: 100% !important; background: #ffffff;"
    >
      <tr>
        <td align="center" valign="top">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            align="center"
            style="width: 600px; background: #b5ddec;"
          >
            <tr>
              <td
                align="center"
                valign="middle"
                style="
                  font-family: Verdana, Arial, sans-serif;
                  font-size: 26px;
                  line-height: 26px;
                  font-weight: 500;
                  color: #000000;
                  padding: 30px 24px 26px;
                "
              >
                ${splitCode(code)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!-- END CODE -->

    <!-- CONTENT -->
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="margin: 0; padding: 0; width: 100%; line-height: 100% !important; background: #ffffff;"
    >
      <tr>
        <td align="center" valign="top">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            align="center"
            style="width: 600px; background: #ffffff;"
          >
            <tr>
              <td
                background="https://${domainName}/images/email/bg-squares.png"
                bgcolor="#ffffff"
                width="600"
                valign="top"
              >
                <!--[if gte mso 9]>
                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;">
                  <v:fill type="tile" src="https://${domainName}/images/email/bg-squares.png" color="#ffffff" />
                  <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
                <![endif]-->
                <div>
                  <table cellpadding="0" cellspacing="0" border="0" align="left">
                    <tr>
                      <td
                        align="left"
                        valign="top"
                        style="
                          font-family: Verdana, Arial, sans-serif;
                          font-size: 24px;
                          line-height: 24px;
                          font-weight: 500;
                          color: #0019a5;
                          padding: 30px 30px 20px;
                        "
                        class="rwd-padding"
                      >
                        Verify
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="left"
                        valign="top"
                        style="
                          font-family: Verdana, Arial, sans-serif;
                          font-size: 16px;
                          line-height: 24px;
                          font-weight: 400;
                          color: #0090d0;
                          padding: 0px 30px 10px;
                        "
                        class="rwd-padding"
                      >
                        Verify your email address by entering the folllowing code on the app prompt:
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="left"
                        valign="top"
                        style="
                          font-family: Verdana, Arial, sans-serif;
                          font-size: 16px;
                          line-height: 24px;
                          font-weight: 500;
                          color: #000000;
                          padding: 0px 30px 30px;
                        "
                        class="rwd-padding"
                      >
                      ${splitCode(code)}
                      </td>
                    </tr>
                  </table>
                </div>
                <!--[if gte mso 9]>
                </v:textbox>
              </v:rect>
              <![endif]-->
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- END CONTENT -->

    <!-- FOOTER -->
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="margin: 0; padding: 0; width: 100%; line-height: 100% !important; background: #ffffff;"
    >
      <tr>
        <td align="center" valign="top">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            align="center"
            style="width: 600px; background: #48acde;"
          >
            <tr>
              <td align="right" valign="middle" style="padding: 10px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" align="right" class="rwd-fixed">
                  <tr>
                    <td
                      align="right"
                      valign="middle"
                      style="
                        font-family: Verdana, Arial, sans-serif;
                        font-size: 12px;
                        font-weight: 400;
                        color: #ffffff;
                        padding-right: 10px;
                      "
                    >
                      <a
                        href="https://${domainName}/help"
                        style="text-decoration: none; color: #ffffff;"
                        ><span style="color: #ffffff;">Help</span></a
                      >
                    </td>
                    <td
                      align="right"
                      valign="middle"
                      style="
                        font-family: Verdana, Arial, sans-serif;
                        font-size: 12px;
                        font-weight: 400;
                        color: #ffffff;
                        padding-left: 10px;
                        border-left: 1px solid rgb(255, 255, 255, 0.4);
                      "
                    >
                      <a
                        href="https://${domainName}/privacy"
                        style="text-decoration: none; color: #ffffff;"
                        ><span style="color: #ffffff;">Privacy</span></a
                      >
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- END FOOTER -->

    <!-- GMAIL FIX - FORCE FULL WIDTH -->
    <!--[if !mso]><!-- -->
    <img
      style="min-width: 600px;"
      class="rwd-hide"
      width="600"
      height="10"
      src="https://${domainName}/images/email/blank.gif"
    />
    <!--<![endif]-->
  </body>
</html>

`;

export const verifyText = (code: string) => `Office Booker


${code}

Verify your email address by entering the above code on the app prompt.




Powered by The Lab
[https://github.com/o2Labs/]`;
