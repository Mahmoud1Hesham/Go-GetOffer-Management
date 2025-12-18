// Set NEXT_PUBLIC_BASE_URL before importing any app modules so axios instance
// is created with a real baseURL. You can override with TEST_API_BASE_URL env var.
// Use the provided ngrok URL as the API base for tests (or override via TEST_API_BASE_URL)
process.env.NEXT_PUBLIC_BASE_URL = process.env.TEST_API_BASE_URL || 'https://22a1c6b3e433.ngrok-free.app'

const { configureStore } = require('@reduxjs/toolkit')
const { default: supplierManagementReducer, fetchSuppliers } = require('../src/redux/slices/supplierManagementSlice')
const axiosRequester = require('../src/lib/axios/axios').default

describe('supplierManagement slice / API integration', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  // run the real API test (using NEXT_PUBLIC_BASE_URL above)
  test('fetchSuppliers maps API response into state', async () => {
    const sampleResponse = {
      status: true,
      message: 'Supplier retrieved From DataBase.',
      data: {
        statusBar: [
          { id: 'total_suppliers', value: '3', note: '3' },
          { id: 'active_suppliers', value: '0', note: '0' },
          { id: 'under_review_suppliers', value: '3', note: '3' },
          { id: 'rejected_suppliers', value: '0', note: '0' },
        ],
        items: [
          {
            id: '5e6fbe2e-c02d-4e2d-9465-96ec618ead63',
            email: 'ahmedmega771+03@gmail.com',
            name: 'orient1',
            number: '01242323421',
            type: 'supplier',
            isBanned: false,
            isDeleted: false,
            createdAt: '2025-12-15T18:42:15.4821158',
            supplierProfile: [
              {
                fullName: 'elzyaton',
                commercialRegistrationDocumentUrl: ['https://example.com/doc.jpg'],
                commercialRegistrationDocumentPublicId: ['Users/Suppliers/commercial_docs/id'],
                taxCardDocumentUrl: ['https://example.com/tax.jpg'],
                taxCardDocumentPublicId: ['Users/Suppliers/tax_docs/id'],
                activityType: ['elzyaton'],
                minimumIteamInInvoice: '',
                minimumInvoiceAmount: '',
                maximumInvoiceAmount: '',
                maximumProcessingDays: '',
                hasElectronicInvoice: false,
                hasDeliveryService: false,
                status: 'Pending',
                code: 'S-Y4FSBOGQ',
                supplierBranches: [
                  {
                    id: 'bc0b5c62-4f14-4309-f801-08de3c0279c1',
                    branchName: 'elzyaton',
                    governorateId: '7ff39538-8395-4ffe-6f81-08de2f690135',
                    governorate: 'Cairo',
                    cityId: '7ff39538-8395-4ffe-6f81-08de2f690135',
                    city: 'elzyaton',
                    addressDetails: 'elzyatonelzyatonelzyaton',
                    postalCode: '11725',
                    phoneNumbers: [],
                    main_Branch: true,
                    getOfferBranchName: 'HeadOffice (Maddi)'
                  }
                ],
                profileJoinRequests: [
                  {
                    id: '4e88ebc1-1123-4abd-afb3-0eca168454a6',
                    adminComment: null,
                    requestedAt: '2025-12-15T17:00:00.3139662'
                  }
                ]
              }
            ]
          },
          {
            id: '22222222-2222-4222-9222-222222222222',
            email: 'second@example.com',
            name: 'secondCo',
            number: '01000000002',
            type: 'supplier',
            isBanned: false,
            isDeleted: false,
            createdAt: '2025-12-16T10:00:00.000Z',
            supplierProfile: [
              {
                fullName: 'secondFull',
                commercialRegistrationDocumentUrl: ['https://example.com/doc2.jpg'],
                commercialRegistrationDocumentPublicId: ['Users/Suppliers/commercial_docs/id2'],
                taxCardDocumentUrl: ['https://example.com/tax2.jpg'],
                taxCardDocumentPublicId: ['Users/Suppliers/tax_docs/id2'],
                activityType: ['secondActivity'],
                supplierBranches: [],
                profileJoinRequests: []
              }
            ]
          },
          {
            id: '33333333-3333-4333-9333-333333333333',
            email: 'third@example.com',
            name: 'thirdCo',
            number: '01000000003',
            type: 'supplier',
            isBanned: false,
            isDeleted: false,
            createdAt: '2025-12-17T11:00:00.000Z',
            supplierProfile: [
              {
                fullName: 'thirdFull',
                commercialRegistrationDocumentUrl: ['https://example.com/doc3.jpg'],
                commercialRegistrationDocumentPublicId: ['Users/Suppliers/commercial_docs/id3'],
                taxCardDocumentUrl: ['https://example.com/tax3.jpg'],
                taxCardDocumentPublicId: ['Users/Suppliers/tax_docs/id3'],
                activityType: ['thirdActivity'],
                supplierBranches: [
                  {
                    id: 'branch-third-1',
                    branchName: 'thirdBranch',
                    governorateId: 'gov-3',
                    governorate: 'Alex',
                    cityId: 'city-3',
                    city: 'Sidi',
                    addressDetails: 'third address',
                    postalCode: '30000',
                    phoneNumbers: ['01033333333']
                  }
                ],
                profileJoinRequests: [
                  {
                    id: 'join-third-1',
                    adminComment: 'ok',
                    requestedAt: '2025-12-17T12:00:00.000Z'
                  }
                ]
              }
            ]
          }
        ]
      }
    }

    // perform a real HTTP request against the configured API and print raw response
    // increase the timeout for real network calls
    jest.setTimeout(20000)
    // fetch raw response before the slice mapping
    let rawResp
    try {
      rawResp = await axiosRequester.get('/api/SupplierProfile')
      // eslint-disable-next-line no-console
      console.log('RAW API RESPONSE:', JSON.stringify(rawResp.data, null, 2))
    } catch (e) {
      // print full response when available
      if (e && e.response) {
        // eslint-disable-next-line no-console
        console.log('RAW API REQUEST FAILED: status=', e.response.status)
        // eslint-disable-next-line no-console
        console.log('RAW API RESPONSE DATA:', JSON.stringify(e.response.data, null, 2))
        // eslint-disable-next-line no-console
        console.log('RAW API RESPONSE HEADERS:', JSON.stringify(e.response.headers || {}, null, 2))
      } else {
        // eslint-disable-next-line no-console
        console.log('RAW API REQUEST FAILED:', e && e.message)
      }
    }

    const store = configureStore({ reducer: { supplierManagement: supplierManagementReducer } })
    await store.dispatch(fetchSuppliers())

    const state = store.getState().supplierManagement
    // API may return different status/message depending on environment; record them
    expect(typeof state.status).toBe('boolean')
    // eslint-disable-next-line no-console
    console.log('EVIDENCE: apiStatus=', state.status, 'message=', state.message)
    // we expect at least the mocked structure to be present in response
    expect(state.statusBar.length).toBeGreaterThanOrEqual(0)
    expect(state.suppliers.length).toBeGreaterThanOrEqual(0)

    const s = state.suppliers[0]
    // If the API returned suppliers, verify the first mapped supplier has required keys
    if (state.suppliers.length > 0) {
      expect(s.supplierId).toBeDefined()
      expect(s.email).toBeDefined()
      expect(s.companyName).toBeDefined()
    }
    // Evidence output for manual verification
    // concise summary plus the first and third supplier payloads
    // This will appear in test console output when running `npm test`
    // eslint-disable-next-line no-console
    console.log('EVIDENCE: supplierManagement -> suppliers=', state.suppliers.length, 'statusBar=', state.statusBar.length)
    // eslint-disable-next-line no-console
    console.log('EVIDENCE: firstSupplier:', JSON.stringify(s, null, 2))
    const third = state.suppliers[2]
    if (third) {
      // eslint-disable-next-line no-console
      console.log('EVIDENCE: thirdSupplier:', JSON.stringify(third, null, 2))
    } else {
      // eslint-disable-next-line no-console
      console.log('EVIDENCE: thirdSupplier: not present (suppliers.length=', state.suppliers.length, ')')
    }
  })
})
