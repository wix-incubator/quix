import UrlPattern from 'url-pattern';
import {
  IUser,
  IHistory,
  IFile,
  INotebook,
  INote,
  IFolder,
  createUser,
  createHistory,
  createNotebook,
  createFolder,
  createFile,
  createNote,
  createFolderPayload,
  createDeletedNotebook,
} from '@wix/quix-shared';
import * as moment from 'moment';
import { ServerTreeItem } from '../src/components/db-sidebar/db-sidebar-types';
import { v4 as uuidv4 } from 'uuid';

export const MockNoteContent = {
  success: 'do success',
  error: 'do error',
  permissionError: 'do permission error',
  sql: 'do SQL',
};

const mocks = {
  '/api/user': () => {
    return { ...createUser(), stats: { trashBinCount: trashBin.length } };
  },
  '/api/events': () => [200],
  '/api/users': () =>
    [...Array(200).keys()].map((key) =>
      createMockUser({
        id: uuidv4(),
        email: 'valery' + key + '@wix.com',
        avatar: 'http://quix.wix.com/assets/user.svg',
        name: 'Valery Frolov' + key,
        rootFolder: '6c98fe9a-39f7-4674-b003-70f9061bbee5',
        dateCreated: Date.now(),
        dateUpdated: Date.now(),
      })
    ),
  '/api/history': () => {
    return [...Array(101).keys()].map((key) =>
      createMockHistory({
        id: '' + key,
        email: 'valery' + key + '@wix.com',
        query: ['SELECT 1', 'SELECT 2'],
        moduleType: key % 2 ? 'presto' : 'athena',
        startedAt: moment.utc().format(),
      })
    );
  },
  // '/api/files': () => [404, {message: 'Couldn\'t fetch notebooks'}],
  // '/api/files': () => [500, {message: 'Failed to fetch files'}],
  '/api/files': () => createMockFiles(),
  // '/api/files': () => createMockFiles([createMockFolder({id: '10'}), createMockFile({id: '11'})]),
  '/api/files/404': () => [404, { message: 'Folder not found' }],
  '/api/files/500': () => [500, { message: "Couldn't fetch folder" }],
  '/api/files/:id': ({ id }) =>
    createMockFolderPayload(
      [createMockFolder({ id: '100' }), createMockFile({ id: '101' })],
      {
        id,
        ownerDetails: {
          avatar: 'http://quix.wix.com/assets/user.svg',
        } as any,
      }
    ),
  '/api/notebook/404': () => [404, { message: 'Notebook not found' }],
  '/api/notebook/500': () => [500, { message: "Couldn't fetch notebook" }],
  '/api/notebook/:id': ({ id }) => {
    let noteId = 1001;
    return createMockNotebook(
      [
        createMockNote(id, {
          id: `${noteId++}`,
          name: 'Runnable',
          content: MockNoteContent.success,
        }),
        createMockNote(id, {
          id: `${noteId++}`,
          name: 'Runnable',
          content: MockNoteContent.success,
          type: 'python',
        }),
        createMockNote(id, {
          id: `${noteId++}`,
          name: 'Runnable (timeout)',
          content: `${MockNoteContent.success} timeout=200`,
        }),
        createMockNote(id, {
          id: `${noteId++}`,
          name: 'Runnable (error)',
          content: MockNoteContent.error,
        }),
        createMockNote(id, {
          id: `${noteId++}`,
          name: 'Runnable (permission error)',
          content: MockNoteContent.permissionError,
        }),
        createMockNote(id, {
          id: `${noteId++}`,
          name: 'Runnable SQL+JSON Result (Timeout)',
          content: MockNoteContent.sql,
          type: 'python',
        }),
      ],
      {
        id,
        ownerDetails: {
          avatar: 'http://quix.wix.com/assets/user.svg',
        } as any,
      }
    );
  },
  '/api/favorites': () => [
    createMockFile({
      id: '100',
      isLiked: true,
      ownerDetails: {
        id: 'valery@wix.com',
        email: 'valery@wix.com',
        avatar: 'http://quix.wix.com/assets/user.svg',
        name: 'Valery Frolov',
        rootFolder: '6c98fe9a-39f7-4674-b003-70f9061bbee5',
        dateCreated: Date.now(),
        dateUpdated: Date.now(),
      },
    }),
    createMockFile({
      id: '101',
      isLiked: true,
      ownerDetails: {
        id: 'anton@wix.com',
        email: 'anton@wix.com',
        avatar: 'http://quix.wix.com/assets/user.svg',
        name: 'Anton Podolsky',
        rootFolder: 'de6908dd-7f1e-4803-ab0d-5f9d6a496609',
        dateCreated: Date.now(),
        dateUpdated: Date.now(),
      },
    }),
  ],
  '/api/search/none': () => ({ count: 0, notes: [] }),
  '/api/search/500': () => [500, { message: 'Search error' }],
  '/api/search/:text': ({ text }) => {
    const res = [createMockNote('1'), createMockNote('2'), createMockNote('3')];
    const term = { fullText: text, content: [{ type: 1, text }] };
    res.forEach(
      (note) =>
        (note.content = `SELECT
    date_trunc('year', shipdate) as ${text}
    , shipmode
    , sum(quantity) quantity
FROM $schema.lineitem
GROUP BY 1, 2
ORDER BY 1
`)
    );

    // return {notes: [], count: 0};
    return { notes: res, count: 365, term };
  },
  // '/api/db/presto/explore': () => [500, {message: 'Failed to fetch DB tree'}],
  // '/api/db/presto/explore': () => [],
  '/api/db/:type/explore': ({ type }) => {
    if (type === 'presto') {
      const response = [];
      for (let i = 0; i < 50; i++) {
        response.push({
          name: 'catalog' + i,
          type: 'catalog',
          children: [
            {
              name: 'schema' + i,
              type: 'schema',
              children: [
                {
                  name: 'table' + i,
                  type: 'table',
                  children: [],
                },
              ],
            },
          ],
        });
      }
      return response;
    }

    return [
      {
        name: '__root',
        type: 'catalog',
        children: [
          {
            name: 'schema',
            type: 'schema',
            children: [
              {
                name: 'table_with_a_very_looooooooooooooooong_name',
                type: 'table',
                children: [],
              },
            ],
          },
          {
            name: 'schema2',
            type: 'schema',
            children: [],
          },
        ],
      },
    ];
  },
  '/api/db/:type/explore/:catalog/:schema/:table': ({ table }) => ({
     //children: [{name: { name: `column_of_${table}`, dataType: 'row(food row(pizza varchar, pasta varchar))' }}],
     //children: [{name: { name: `column_of_${table}`, dataType: 'row(food row(asian row(sushi varchar,dimsum varchar),italian row(pizza varchar, pasta varchar)), movies row(action row(theMatrix varchar, braveHeart varchar), burekas row(charlie1AndAHalf varchar, eskimoLimon varchar)), dddddd varchar, eeeeee varchar))' }}],
    children: [
                {name: { name: `colA`, dataType: 'varchar' }},
                {name: { name: `colB`, dataType: 'varchar' }},
                {name: { name: `colC`, dataType: 'varchar' }},
                {name: { name: `colD`, dataType: 'varchar' }},
                {name: { name: `collSmallObject`, dataType: 'row(food row(pizza varchar, pasta varchar), drinks row(beer varchar, vodka varchar))' }},
                {name: { name: `collBigObject`, dataType: 'row(movies row(action row(The_Dark_Knight varchar, Mad_Max varchar, Die_Hard varchar), comedy row(The_Big_Lebowski varchar, Superbad varchar, The_Grand_Budapest_Hotel varchar), drama row(The_Shawshank_Redemption varchar, Titanic varchar, Forrest_Gump varchar)), tvSeries row(HBO row(Game_of_Thrones varchar, The_Sopranos varchar, Westworld varchar), netflix row(Stranger_Things varchar, The_Crown varchar, Narcos varchar), amazon row(The_Boys varchar, Fleabag varchar, The_Marvelous_MrsMaisel varchar)))' }},
              ],
    //children: [{name: { name: `column_of_${table}`, dataType: 'row(id varchar, line_items array(row(id varchar, quantity bigint, catalog_reference row(catalog_item_id varchar, app_id varchar, options map(varchar, varchar)), product_name row(original varchar, translated varchar), url row(relative_path varchar, url varchar), price row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), line_item_price row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), full_price row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), price_before_discounts row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), total_price_after_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), total_price_before_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_details row(taxable_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_group_id varchar, tax_rate varchar, total_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), rate_breakdown array(row(name varchar, rate varchar, tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_type varchar, jurisdiction_name varchar, jurisdiction_type varchar, exempt_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), exemption_ids array(bigint), taxable_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), is_fee boolean)), exempt_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), is_item_taxable boolean, is_tax_included boolean, calculator_name varchar), discount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), description_lines array(row(plain_text row(original varchar, translated varchar), color_info row(original varchar, translated varchar, code varchar), plain_text_value row(original varchar, translated varchar), color varchar, name row(original varchar, translated varchar), line_type varchar)), media row(id varchar, url varchar, height bigint, width bigint, alt_text varchar, url_expiration_date timestamp(6), filename varchar, size_in_bytes varchar), availability row(status varchar, quantity_available bigint), physical_properties row(weight double, sku varchar, shippable boolean), coupon_scopes array(row(namespace varchar, group row(name varchar, entity_id varchar))), item_type row(preset varchar, custom varchar), subscription_option_info row(subscription_settings row(frequency varchar, interval bigint, auto_renewal boolean, billing_cycles bigint), title row(original varchar, translated varchar), description row(original varchar, translated varchar)), fulfiller_id varchar, shipping_group_id varchar, digital_file row(id varchar, file_name varchar, file_type varchar), payment_option varchar, service_properties row(scheduled_date timestamp(6), number_of_participants bigint), root_catalog_item_id varchar, price_description row(original varchar, translated varchar), deposit_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), delivery_profile_id varchar)), billing_info row(addresses_service_id varchar), shipping_info row(shipping_destination row(addresses_service_id varchar), selected_carrier_service_option row(code varchar, title varchar, logistics row(delivery_time varchar, instructions varchar, pickup_details row(business_location boolean, pickup_method varchar), delivery_time_slot row(from timestamp(6), to timestamp(6))), cost row(total_price_after_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), total_price_before_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_details row(taxable_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_group_id varchar, tax_rate varchar, total_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), rate_breakdown array(row(name varchar, rate varchar, tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_type varchar, jurisdiction_name varchar, jurisdiction_type varchar, exempt_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), exemption_ids array(bigint), taxable_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), is_fee boolean)), exempt_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), is_item_taxable boolean, is_tax_included boolean, calculator_name varchar), total_discount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), price row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar)), requested_shipping_option boolean, other_charges array(row(type varchar, details varchar, cost row(total_price_after_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), total_price_before_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_details row(taxable_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_group_id varchar, tax_rate varchar, total_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), rate_breakdown array(row(name varchar, rate varchar, tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_type varchar, jurisdiction_name varchar, jurisdiction_type varchar, exempt_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), exemption_ids array(bigint), taxable_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), is_fee boolean)), exempt_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), is_item_taxable boolean, is_tax_included boolean, calculator_name varchar), total_discount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), price row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar)))), carrier_id varchar), region row(id varchar, name varchar), carrier_service_options array(row(carrier_id varchar, shipping_options array(row(code varchar, title varchar, logistics row(delivery_time varchar, instructions varchar, pickup_details row(business_location boolean, pickup_method varchar), delivery_time_slot row(from timestamp(6), to timestamp(6))), cost row(price row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), other_charges array(row(type varchar, price row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar))))))))), buyer_note varchar, buyer_info row(visitor_id varchar, member_id varchar, open_access boolean, contact_id varchar), conversion_currency varchar, price_summary row(subtotal row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), shipping row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), discount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), total row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), additional_fees row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar)), calculation_errors row(general_shipping_calculation_error row(application_error row(code varchar, description varchar, data map(varchar, varchar)), validation_error row(field_violations array(row(field varchar, description varchar, violated_rule varchar, rule_name varchar, data map(varchar, varchar)))), tracing map(varchar, varchar)), carrier_errors row(errors array(row(carrier_id varchar, error row(application_error row(code varchar, description varchar, data map(varchar, varchar)), validation_error row(field_violations array(row(field varchar, description varchar, violated_rule varchar, rule_name varchar, data map(varchar, varchar)))), tracing map(varchar, varchar))))), tax_calculation_error row(application_error row(code varchar, description varchar, data map(varchar, varchar)), validation_error row(field_violations array(row(field varchar, description varchar, violated_rule varchar, rule_name varchar, data map(varchar, varchar)))), tracing map(varchar, varchar)), coupon_calculation_error row(application_error row(code varchar, description varchar, data map(varchar, varchar)), validation_error row(field_violations array(row(field varchar, description varchar, violated_rule varchar, rule_name varchar, data map(varchar, varchar)))), tracing map(varchar, varchar)), gift_card_calculation_error row(application_error row(code varchar, description varchar, data map(varchar, varchar)), validation_error row(field_violations array(row(field varchar, description varchar, violated_rule varchar, rule_name varchar, data map(varchar, varchar)))), tracing map(varchar, varchar)), order_validation_errors array(row(code varchar, description varchar, data map(varchar, varchar))), membership_error row(application_error row(code varchar, description varchar, data map(varchar, varchar)), validation_error row(field_violations array(row(field varchar, description varchar, violated_rule varchar, rule_name varchar, data map(varchar, varchar)))), tracing map(varchar, varchar)), discounts_calculation_error row(application_error row(code varchar, description varchar, data map(varchar, varchar)), validation_error row(field_violations array(row(field varchar, description varchar, violated_rule varchar, rule_name varchar, data map(varchar, varchar)))), tracing map(varchar, varchar))), gift_card row(id varchar, obfuscated_code varchar, amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), app_id varchar), applied_discounts array(row(coupon row(id varchar, code varchar, amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), name varchar, coupon_type varchar), merchant_discount row(amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar)), discount_rule row(id varchar, name row(original varchar, translated varchar), amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar)), discount_type varchar, line_item_ids array(varchar))), custom_fields array(row(value varchar, title varchar, translated_title varchar)), weight_unit varchar, tax_summary row(taxable_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), total_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), manual_tax_rate varchar, calculation_details row(manual_rate_reason varchar, auto_tax_fallback_details row(fallback_reason varchar, error row(code varchar, description varchar, data map(varchar, varchar))), rate_type varchar), tax_estimation_id varchar, average_tax_rate varchar, total_exempt row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar)), currency varchar, channel_type varchar, site_language varchar, buyer_language varchar, completed boolean, tax_included_in_price boolean, created_by row(user_id varchar, member_id varchar, visitor_id varchar, app_id varchar), created_date timestamp(6), updated_date timestamp(6), pay_now row(subtotal row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), shipping row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), discount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), total row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), additional_fees row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar)), pay_later row(subtotal row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), shipping row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), discount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), total row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), additional_fees row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar)), membership_options row(eligible_memberships array(row(id varchar, app_id varchar, name row(original varchar, translated varchar), line_item_ids array(varchar), credits row(total bigint, remaining bigint), expiration_date timestamp(6), additional_data map(varchar, varchar))), invalid_memberships array(row(membership row(id varchar, app_id varchar, name row(original varchar, translated varchar), line_item_ids array(varchar), credits row(total bigint, remaining bigint), expiration_date timestamp(6), additional_data map(varchar, varchar)), reason varchar)), selected_memberships row(memberships array(row(id varchar, app_id varchar, line_item_ids array(varchar))))), additional_fees array(row(code varchar, name varchar, price row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_details row(taxable_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_group_id varchar, tax_rate varchar, total_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), rate_breakdown array(row(name varchar, rate varchar, tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), tax_type varchar, jurisdiction_name varchar, jurisdiction_type varchar, exempt_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), exemption_ids array(bigint), taxable_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), is_fee boolean)), exempt_amount row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), is_item_taxable boolean, is_tax_included boolean, calculator_name varchar), provider_app_id varchar, price_before_tax row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar))), cart_id varchar, conversion_info row(site_currency varchar, conversion_rate varchar), pay_now_total_after_gift_card row(amount varchar, converted_amount varchar, formatted_amount varchar, formatted_converted_amount varchar), ecom_id varchar, violations array(row(severity varchar, target row(other row(name varchar), line_item row(name varchar, id varchar)), description varchar)))'}}]
  }),
  '/api/db/:type/autocomplete': () => ({
    catalogs: ['catalog', 'catalog2'],
    schemas: ['schema'],
    tables: ['table'],
    columns: ['column'],
  }),
  '/api/autocomplete/:type': () => [
    { value: 'apollo', meta: 'table' },
    { value: 'prod', meta: 'table' },
    { value: 'wt_metasites', meta: 'table' },
  ],
  // '/api/db/:type/search': () => [],
  '/api/db/:type/search': () => {
    const response = [];
    for (let i = 0; i < 10; i++) {
      response.push({
        name: 'catalog' + i,
        type: 'catalog',
        children: [
          {
            name: 'schema' + i,
            type: 'schema',
            children: [
              {
                name: 'table' + i,
                type: 'table',
                children: [],
              },
            ],
          },
        ],
      });
    }
    return response;
  },
  '/api/deletedNotebooks': () => [...trashBin],
};

const createMockDeletedNotebook = (name?: string) => {
  return name
    ? { ...createDeletedNotebook(), name }
    : createMockDeletedNotebook();
};

const trashBin = [];
// We can use this loop to simulate different counts on trash bin icon badge
for (let i = 0; i < 1; i++) {
  trashBin.push(
    ...[
      createMockDeletedNotebook('Removed 1'),
      createMockDeletedNotebook('Bad Queries'),
      createMockDeletedNotebook('By Mistake'),
      createMockDeletedNotebook('Trash'),
    ]
  );
}

let mockOverrides = {};

export const createMockUser = (props: Partial<IUser> = {}) => {
  return createUser(props);
};

export const createMockHistory = (props: Partial<IHistory> = {}) => {
  return createHistory(props);
};

export const createMockRootFolder = (props: Partial<IFile> = {}) => {
  return createFolder([], {
    id: '1',
    name: 'My notebooks',
    owner: 'local@quix.com',
    ownerDetails: {
      avatar: 'http://quix.wix.com/assets/user.svg',
    } as any,
    ...props,
  });
};

export const createMockFile = (props: Partial<IFile> = {}) => {
  return createFile([{ id: '1', name: 'My notebooks' }], {
    owner: 'local@quix.com',
    ...props,
  });
};

export const createMockFolder = (props: Partial<IFile> = {}) => {
  return createFolder([{ id: '1', name: 'My notebooks' }], {
    owner: 'local@quix.com',
    ...props,
  });
};

export const createMockFiles = (children = []) => {
  return [
    createMockRootFolder(),
    ...children.map((child) => ({
      ...child,
    })),
  ];
};

export const createMockFolderPayload = (
  children = [],
  props: Partial<IFolder> = {}
) => {
  return createFolderPayload([{ id: '1', name: 'My notebooks' }], {
    owner: 'local@quix.com',
    files: children.map((child, index) => ({
      ...child,
      // tslint:disable-next-line: restrict-plus-operands
      id: `${index + 100}`,
    })),
    ...props,
  });
};

export const createMockNotebook = (
  notes = [],
  props: Partial<INotebook> = {}
) => {
  return createNotebook([{ id: '1', name: 'My notebooks' }], {
    owner: 'local@quix.com',
    notes,
    ...props,
  });
};

export const createMockNote = (
  notebookId: string = '1',
  props: Partial<INote> = {}
) => {
  return createNote(notebookId, { owner: 'local@quix.com', ...props });
};

export const createMockDbExplorer = (
  items: ServerTreeItem[] = []
): ServerTreeItem[] => {
  return items.length > 0 ? items : [createMockDbExplorerItem()];
};

export const createMockDbExplorerItem = (
  props: Partial<ServerTreeItem> = {}
): ServerTreeItem => {
  return {
    name: props.name || 'treeItem',
    type: props.type || 'catalog',
    children: props.children || [],
  };
};

export const mock = async (
  patternOrUrl: string,
  patternPayload?: any,
  options?: {}
) => {
  if (patternPayload) {
    mockOverrides[patternOrUrl] = { options, getPayload: () => patternPayload };
  } else {
    const [status, payload, delay] = Object.keys(mocks).reduce((res, key) => {
      if (!res) {
        const match = new UrlPattern(key).match(patternOrUrl);

        if (match) {
          let payloadResult = (mockOverrides[key]?.getPayload || mocks[key])(
            match
          );

          if (payloadResult && typeof payloadResult[0] !== 'number') {
            payloadResult = [200, payloadResult];
          }

          return [...payloadResult, mockOverrides[key]?.options?.delay];
        }
      }

      return res;
    }, null) || [404, { message: 'Mock not found' }];

    if (delay) {
      await new Promise((res) => setTimeout(res, delay));
    }
    return [status, payload];
  }
};

export const reset = () => {
  mockOverrides = {};
};
