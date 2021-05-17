import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 2rem 2rem 2.4rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 3rem 3rem 4rem;
  }

  > .title {
    display: flex;
    align-items: flex-end;

    > h2 {
      flex: 0 0 auto;

      margin: 0 2rem 0 0;

      color: ${(props) => props.theme.palette.primary.main};
      font-size: 2.4rem;
      line-height: 2.4rem;
      font-weight: 400;
    }

    > button {
      flex: 0 0 auto;
    }
  }

  > .change {
    margin: 0.4rem 0 0 0.2rem;

    font-size: 1.2rem;
    font-weight: bold;
  }

  > p.notice {
    ${(props) => props.theme.breakpoints.up('xs')} {
      margin: 1.6rem 0 0;
    }

    ${(props) => props.theme.breakpoints.up('sm')} {
      margin: 2rem 0 0;
    }

    color: #e21c33;
  }

  > p.noShowNotice {
    ${(props) => props.theme.breakpoints.up('xs')} {
      margin: 1.6rem 0 0;
    }

    ${(props) => props.theme.breakpoints.up('sm')} {
      margin: 2rem 0 0;
    }

    color: #0019a5;
    font-weight: bold;
  }

  > ul {
    ${(props) => props.theme.breakpoints.up('xs')} {
      margin: 1.6rem 0 0;
    }

    ${(props) => props.theme.breakpoints.up('sm')} {
      margin: 2rem 0 0;
    }

    padding: 0 0 0 2rem;

    > li {
      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      line-height: 2.4rem;
      font-weight: 400;

      > span {
        color: ${(props) => props.theme.palette.primary.main};
        font-weight: bold;
      }
    }
  }

  > .bookings {
    max-width: 40rem;

    ${(props) => props.theme.breakpoints.only('xs')} {
      padding: 1.2rem 1.8rem 1.8rem;
      margin-top: 2.4rem;
    }

    ${(props) => props.theme.breakpoints.up('sm')} {
      padding: 1.2rem 2.8rem 2.8rem;
      margin-top: 3rem;
    }

    > .menu {
      display: flex;
      align-items: center;
      justify-content: center;

      ${(props) => props.theme.breakpoints.only('xs')} {
        flex-wrap: wrap;
      }

      > .back,
      > .forward,
      > .refresh {
        flex: 0 0 auto;

        .icon {
          font-size: 4rem;
        }
      }

      > .date {
        flex: 0 0 auto;

        padding: 0 2rem;

        text-align: center;

        > h3 {
          margin: 0;

          font-size: 2rem;
          color: ${(props) => props.theme.palette.primary.main};
        }
      }
    }

    > .details {
      display: flex;

      ${(props) => props.theme.breakpoints.only('xs')} {
        flex-wrap: wrap;
        justify-content: center;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        justify-content: space-between;
      }

      margin: 0.8rem 0 0;
      padding: 0 2rem;

      > .quota {
        ${(props) => props.theme.breakpoints.only('xs')} {
          flex: 1 1 100%;
        }

        ${(props) => props.theme.breakpoints.up('sm')} {
          flex: 0 0 auto;
        }

        margin: 0;

        color: ${(props) => props.theme.palette.secondary.main};
        font-size: 1.4rem;
        text-align: center;

        > span {
          color: ${(props) => props.theme.palette.primary.main};
          font-size: 1.4rem;
          font-weight: bold;
        }
      }

      > .upcoming-bookings {
        ${(props) => props.theme.breakpoints.only('xs')} {
          flex: 1 1 100%;

          padding-top: 0.4rem;
        }

        ${(props) => props.theme.breakpoints.up('sm')} {
          flex: 0 0 auto;
        }

        margin: 0;

        text-align: center;

        > button {
          color: ${(props) => props.theme.palette.primary.main};
          font-weight: bold;
        }
      }
    }

    > .grid {
      margin-top: 1.8rem;

      > .row {
        display: flex;
        align-items: center;

        position: relative;

        ${(props) => props.theme.breakpoints.up('xs')} {
          padding: 1.2rem 1.8rem;

          flex-wrap: wrap;
          justify-content: flex-end;
        }

        ${(props) => props.theme.breakpoints.up('sm')} {
          padding: 1.6rem 2rem;
        }

        background: #f5f5f5;

        &:not(:first-of-type) {
          margin-top: 0.8rem;
        }

        &[data-today='true'] {
          background: #efefef;
        }

        &[data-bookable='false'] {
          opacity: 0.5;
        }

        > .left {
          flex: 1 1 auto;

          > .date {
            margin: 0;
          }
        }

        > .right {
          flex: 0 0 auto;

          text-align: right;

          > .slide {
            height: fit-content;
            width: 100%;
            z-index: 1;

            position: absolute;
            right: 0;
            top: -9rem;

            display: flex;
            flex-direction: column;

            background-color: ${(props) => props.theme.palette.secondary.main};
            color: #f5f5f5;
            box-shadow: 0rem 0.4rem 0.3rem #0000004d;
            text-align: left;
            padding: 1.4rem 1rem;

            p {
              margin: 0 0 1rem;

              > svg {
                margin-right: 0.6rem;
                font-size: 1.8rem;
                font-weight: 600;
              }
            }

            .slide-btns {
              display: flex;
              justify-content: flex-end;

              button {
                border: none;
              }

              .cancel-btn {
                background: none;
                text-decoration: underline;
                color: #f5f5f5;
              }

              .confirm-btn {
                width: fit-content;
                display: flex;
                align-items: center;

                margin-left: 1.2rem;
                padding: 0.8rem;
                color: ${(props) => props.theme.palette.primary.main};

                svg {
                  margin-left: 0.2rem;
                }
              }
            }
          }

          > .no-booking {
            display: flex;
            justify-content: flex-end;

            > .availability {
              flex: 0 0 auto;

              display: flex;
              align-items: center;
            }

            > .book {
              flex: 0 0 auto;

              padding-left: 1.6rem;
            }
          }

          .cancelBtn {
            margin-right: 1.2rem;
          }

          .disabled {
            color: #a7a7a7;
            cursor: not-allowed;
          }
        }
      }
    }
  }
`;
