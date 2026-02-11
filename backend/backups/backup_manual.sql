--
-- PostgreSQL database dump
--

\restrict fs2YRG3eBsumDMyV76NnbFfZn5jZscDG8MqSfQJgMTN6wLgQOfFrDmH73PSe7rL

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AuditAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuditAction" AS ENUM (
    'CREATE',
    'UPDATE',
    'DELETE'
);


ALTER TYPE public."AuditAction" OWNER TO postgres;

--
-- Name: CustomerType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CustomerType" AS ENUM (
    'RETAIL',
    'WHOLESALE'
);


ALTER TYPE public."CustomerType" OWNER TO postgres;

--
-- Name: MovementType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MovementType" AS ENUM (
    'SALE',
    'RETURN',
    'GRN',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'ADJUSTMENT'
);


ALTER TYPE public."MovementType" OWNER TO postgres;

--
-- Name: POStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."POStatus" AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'CLOSED'
);


ALTER TYPE public."POStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'TRANSFER',
    'MIXED',
    'INSTAPAY',
    'FAWRY',
    'WALLET'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PAID',
    'PARTIAL',
    'UNPAID'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: PaymentTerm; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentTerm" AS ENUM (
    'CASH',
    'DAYS_15',
    'DAYS_30',
    'DAYS_60'
);


ALTER TYPE public."PaymentTerm" OWNER TO postgres;

--
-- Name: ReturnType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReturnType" AS ENUM (
    'STOCK',
    'DEFECTIVE'
);


ALTER TYPE public."ReturnType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    address text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    name_ar character varying(255),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    default_retail_margin double precision,
    default_wholesale_margin double precision
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(50),
    type public."CustomerType" DEFAULT 'RETAIL'::public."CustomerType" NOT NULL,
    tax_number character varying(50),
    address text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: goods_receipt_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods_receipt_lines (
    id integer NOT NULL,
    goods_receipt_id integer NOT NULL,
    product_id integer NOT NULL,
    qty integer NOT NULL,
    cost numeric(10,2) NOT NULL
);


ALTER TABLE public.goods_receipt_lines OWNER TO postgres;

--
-- Name: goods_receipt_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.goods_receipt_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goods_receipt_lines_id_seq OWNER TO postgres;

--
-- Name: goods_receipt_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.goods_receipt_lines_id_seq OWNED BY public.goods_receipt_lines.id;


--
-- Name: goods_receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods_receipts (
    id integer NOT NULL,
    grn_no character varying(50) NOT NULL,
    supplier_id integer NOT NULL,
    branch_id integer NOT NULL,
    related_po_id integer,
    payment_term public."PaymentTerm" DEFAULT 'CASH'::public."PaymentTerm" NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 14 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    created_by integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.goods_receipts OWNER TO postgres;

--
-- Name: goods_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.goods_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goods_receipts_id_seq OWNER TO postgres;

--
-- Name: goods_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.goods_receipts_id_seq OWNED BY public.goods_receipts.id;


--
-- Name: item_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_types (
    id integer NOT NULL,
    subcategory_id integer NOT NULL,
    name character varying(255) NOT NULL,
    name_ar character varying(255),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    default_retail_margin double precision,
    default_wholesale_margin double precision
);


ALTER TABLE public.item_types OWNER TO postgres;

--
-- Name: item_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_types_id_seq OWNER TO postgres;

--
-- Name: item_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_types_id_seq OWNED BY public.item_types.id;


--
-- Name: pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    key character varying(50) NOT NULL,
    name_en character varying(100) NOT NULL,
    name_ar character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    icon character varying(50),
    route character varying(100),
    sort_order integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pages OWNER TO postgres;

--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pages_id_seq OWNER TO postgres;

--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    sales_invoice_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    payment_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    created_by integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_settings (
    id integer NOT NULL,
    platform character varying(50) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0 NOT NULL,
    commission numeric(5,2) DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    icon character varying(10),
    name character varying(100),
    shipping_fee numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.platform_settings OWNER TO postgres;

--
-- Name: platform_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platform_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_settings_id_seq OWNER TO postgres;

--
-- Name: platform_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platform_settings_id_seq OWNED BY public.platform_settings.id;


--
-- Name: price_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_history (
    id integer NOT NULL,
    product_id integer NOT NULL,
    old_price numeric(10,2) NOT NULL,
    new_price numeric(10,2) NOT NULL,
    price_type character varying(20) NOT NULL,
    changed_by integer NOT NULL,
    reason text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.price_history OWNER TO postgres;

--
-- Name: price_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.price_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.price_history_id_seq OWNER TO postgres;

--
-- Name: price_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.price_history_id_seq OWNED BY public.price_history.id;


--
-- Name: product_audits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_audits (
    id integer NOT NULL,
    product_id integer NOT NULL,
    action public."AuditAction" NOT NULL,
    old_data jsonb,
    new_data jsonb,
    user_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_audits OWNER TO postgres;

--
-- Name: product_audits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_audits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_audits_id_seq OWNER TO postgres;

--
-- Name: product_audits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_audits_id_seq OWNED BY public.product_audits.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    barcode character varying(100) NOT NULL,
    name_en character varying(255) NOT NULL,
    name_ar character varying(255),
    category_id integer,
    brand character varying(255),
    unit character varying(50) DEFAULT 'PCS'::character varying NOT NULL,
    cost numeric(10,2) DEFAULT 0 NOT NULL,
    cost_avg numeric(10,2) DEFAULT 0 NOT NULL,
    price_retail numeric(10,2) DEFAULT 0 NOT NULL,
    price_wholesale numeric(10,2) DEFAULT 0 NOT NULL,
    min_qty integer,
    max_qty integer,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    item_type_id integer,
    retail_margin double precision,
    wholesale_margin double precision
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_order_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_lines (
    id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    product_id integer NOT NULL,
    qty integer NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.purchase_order_lines OWNER TO postgres;

--
-- Name: purchase_order_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_order_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_order_lines_id_seq OWNER TO postgres;

--
-- Name: purchase_order_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_order_lines_id_seq OWNED BY public.purchase_order_lines.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    po_no character varying(50) NOT NULL,
    supplier_id integer NOT NULL,
    branch_id integer NOT NULL,
    status public."POStatus" DEFAULT 'DRAFT'::public."POStatus" NOT NULL,
    expected_date timestamp(3) without time zone NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_orders_id_seq OWNER TO postgres;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: role_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_pages (
    role_id integer NOT NULL,
    page_id integer NOT NULL
);


ALTER TABLE public.role_pages OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    is_system boolean DEFAULT false NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sales_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_lines (
    id integer NOT NULL,
    sales_invoice_id integer NOT NULL,
    product_id integer NOT NULL,
    qty integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    line_discount numeric(10,2) DEFAULT 0 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0 NOT NULL,
    line_total numeric(10,2) NOT NULL,
    pricetype character varying(20)
);


ALTER TABLE public.sales_lines OWNER TO postgres;

--
-- Name: sales_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_lines_id_seq OWNER TO postgres;

--
-- Name: sales_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_lines_id_seq OWNED BY public.sales_lines.id;


--
-- Name: sales_return_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_return_lines (
    id integer NOT NULL,
    return_id integer NOT NULL,
    product_id integer NOT NULL,
    qty_returned integer NOT NULL,
    refund_amount numeric(10,2) NOT NULL,
    return_type public."ReturnType" DEFAULT 'STOCK'::public."ReturnType" NOT NULL
);


ALTER TABLE public.sales_return_lines OWNER TO postgres;

--
-- Name: sales_return_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_return_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_return_lines_id_seq OWNER TO postgres;

--
-- Name: sales_return_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_return_lines_id_seq OWNED BY public.sales_return_lines.id;


--
-- Name: salesinvoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salesinvoices (
    id integer NOT NULL,
    invoiceno character varying(50) NOT NULL,
    branchid integer NOT NULL,
    customerid integer,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) DEFAULT 0 NOT NULL,
    totaltax numeric(10,2) DEFAULT 0 NOT NULL,
    totaldiscount numeric(10,2) DEFAULT 0 NOT NULL,
    discountamount numeric(10,2) DEFAULT 0 NOT NULL,
    platformcommission numeric(10,2) DEFAULT 0 NOT NULL,
    channel character varying(50),
    paymentstatus public."PaymentStatus" DEFAULT 'PAID'::public."PaymentStatus" NOT NULL,
    paymentmethod public."PaymentMethod" NOT NULL,
    notes text,
    createdby integer NOT NULL,
    createdat timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat timestamp(3) without time zone NOT NULL,
    costofgoods numeric(10,2),
    grossprofit numeric(10,2),
    netprofit numeric(10,2),
    profitmargin numeric(5,2),
    totalrefunded numeric(10,2) DEFAULT 0 NOT NULL,
    netrevenue numeric(10,2),
    shippingfee numeric(10,2) DEFAULT 0 NOT NULL,
    delivered boolean DEFAULT false NOT NULL,
    deliverydate timestamp(3) without time zone,
    paidamount numeric(10,2) DEFAULT 0 NOT NULL,
    remainingamount numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.salesinvoices OWNER TO postgres;

--
-- Name: salesinvoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salesinvoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salesinvoices_id_seq OWNER TO postgres;

--
-- Name: salesinvoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salesinvoices_id_seq OWNED BY public.salesinvoices.id;


--
-- Name: salesreturns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salesreturns (
    id integer NOT NULL,
    returnno character varying(50) NOT NULL,
    salesinvoiceid integer NOT NULL,
    branchid integer NOT NULL,
    totalrefund numeric(10,2) DEFAULT 0 NOT NULL,
    reason text,
    createdby integer NOT NULL,
    createdat timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.salesreturns OWNER TO postgres;

--
-- Name: salesreturns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salesreturns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salesreturns_id_seq OWNER TO postgres;

--
-- Name: salesreturns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salesreturns_id_seq OWNED BY public.salesreturns.id;


--
-- Name: stock_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_locations (
    id integer NOT NULL,
    branch_id integer NOT NULL,
    name character varying(255) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stock_locations OWNER TO postgres;

--
-- Name: stock_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_locations_id_seq OWNER TO postgres;

--
-- Name: stock_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_locations_id_seq OWNED BY public.stock_locations.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    product_id integer NOT NULL,
    stock_location_id integer NOT NULL,
    qty_change integer NOT NULL,
    movement_type public."MovementType" NOT NULL,
    ref_table character varying(100),
    ref_id integer,
    notes text,
    created_by integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO postgres;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: subcategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subcategories (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(255) NOT NULL,
    name_ar character varying(255),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    default_retail_margin double precision,
    default_wholesale_margin double precision
);


ALTER TABLE public.subcategories OWNER TO postgres;

--
-- Name: subcategories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subcategories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subcategories_id_seq OWNER TO postgres;

--
-- Name: subcategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subcategories_id_seq OWNED BY public.subcategories.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    contact character varying(255),
    phone character varying(50),
    email character varying(255),
    address text,
    payment_terms text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    branch_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: goods_receipt_lines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_lines ALTER COLUMN id SET DEFAULT nextval('public.goods_receipt_lines_id_seq'::regclass);


--
-- Name: goods_receipts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts ALTER COLUMN id SET DEFAULT nextval('public.goods_receipts_id_seq'::regclass);


--
-- Name: item_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_types ALTER COLUMN id SET DEFAULT nextval('public.item_types_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: platform_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings ALTER COLUMN id SET DEFAULT nextval('public.platform_settings_id_seq'::regclass);


--
-- Name: price_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history ALTER COLUMN id SET DEFAULT nextval('public.price_history_id_seq'::regclass);


--
-- Name: product_audits id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_audits ALTER COLUMN id SET DEFAULT nextval('public.product_audits_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_order_lines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_lines ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_lines_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sales_lines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_lines ALTER COLUMN id SET DEFAULT nextval('public.sales_lines_id_seq'::regclass);


--
-- Name: sales_return_lines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_return_lines ALTER COLUMN id SET DEFAULT nextval('public.sales_return_lines_id_seq'::regclass);


--
-- Name: salesinvoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesinvoices ALTER COLUMN id SET DEFAULT nextval('public.salesinvoices_id_seq'::regclass);


--
-- Name: salesreturns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesreturns ALTER COLUMN id SET DEFAULT nextval('public.salesreturns_id_seq'::regclass);


--
-- Name: stock_locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_locations ALTER COLUMN id SET DEFAULT nextval('public.stock_locations_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: subcategories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategories ALTER COLUMN id SET DEFAULT nextval('public.subcategories_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
68cd36ee-1649-4030-a505-dafb25ad8a4c	d4f901e7c14278fd05b3fa3c1d4b7acb06fa0b57ad52cdbebe48b1dce04b5d1a	2026-02-11 19:53:35.785705+02	20251226230231_init	\N	\N	2026-02-11 19:53:35.624266+02	1
dc7f01a2-b49b-4917-89ca-faca73fc602c	df56f9b8118158d9e9a62f77c1381af950ea51b25604ddd608c64b9ffafc95d4	2026-02-11 19:53:35.787678+02	20251228200417_add_platform_name_icon	\N	\N	2026-02-11 19:53:35.786171+02	1
af209050-bde0-42f2-b184-a8bb6c275dcc	3b7142572d66d063a7fe74fc0987f31b8f110ca1446aff79fac3a97db920fc35	2026-02-11 19:53:35.78956+02	20260102220553_npx_prisma_migrate_dev	\N	\N	2026-02-11 19:53:35.788093+02	1
6427d5bc-2e58-4f88-ba06-e50d2bbec554	15f5e1106d92c7c4a758528eb524a325dca07a81c71d53a39d8a4a01ed570f35	2026-02-11 19:53:35.791656+02	20260102221313_add_profit_tracking	\N	\N	2026-02-11 19:53:35.789957+02	1
34198305-4048-4b48-9038-9bb8ca576e08	5377e811d14d330557944bef1eb41541f81a2d8019a7ce279177c9c70a478b4a	2026-02-11 19:53:35.793721+02	20260111153801_add_shipping_fee_to_sales	\N	\N	2026-02-11 19:53:35.792021+02	1
b0fbf8a7-362f-459d-8f7f-94aa7831d22a	684a96f44da4fceb7ab571a51ebfa58224019a4f8e4498d5da9ea1df5f93caea	2026-02-11 19:53:35.809164+02	20260114100157_add_missing_payment_columns	\N	\N	2026-02-11 19:53:35.794184+02	1
1e6f64a1-6d56-4dfd-a8e0-fb2116f29d11	cdef6791e6e4a6422ba177f67b4148ef0dc876c0b12866e5ef62f1d77cf4d83b	2026-02-11 19:53:35.851217+02	20260118131354_add_return_tracking_fields	\N	\N	2026-02-11 19:53:35.809664+02	1
8c0ecf20-99f3-42e5-8cf1-0675588628d4	b0e3437f9a1e9a968cb22de700de4747e05c2070af74263254ceea61d653e2a5	2026-02-11 19:53:35.85308+02	20260121185731_add_price_type_to_sales_line	\N	\N	2026-02-11 19:53:35.851687+02	1
8decdff3-de75-4812-850d-39bcd5f22290	0565e156b889f3f75719ff3119520889eaed477df5278799055d5aba00e330d6	2026-02-11 19:53:35.874995+02	20260121200509_add_page_permissions	\N	\N	2026-02-11 19:53:35.853425+02	1
d4d8a4d3-9905-4312-8a8d-cff9d228cbf1	005aa2500d29ac738e27c88d18b48c096e2611f8787dfb6c3f89abdc4f2325ee	2026-02-11 19:53:35.878055+02	20260205172037_add_margin_columns_to_hierarchy	\N	\N	2026-02-11 19:53:35.875659+02	1
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, code, address, active, created_at, updated_at) FROM stdin;
1	Main Branch	BR001	123 Main Street, City	t	2026-02-11 17:53:37.758	2026-02-11 17:53:37.758
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, name_ar, active, created_at, updated_at, default_retail_margin, default_wholesale_margin) FROM stdin;
1	Mixed	مختلط	t	2026-02-11 17:53:37.775	2026-02-11 17:53:37.775	\N	\N
2	Defective	تلافيات	t	2026-02-11 17:53:37.777	2026-02-11 17:53:37.777	\N	\N
3	TOTAL	TOTAL	t	2026-02-11 17:53:52.257	2026-02-11 17:53:52.257	\N	\N
4	CROWN	CROWN	t	2026-02-11 17:53:52.952	2026-02-11 17:53:52.952	\N	\N
5	INGCO	INGCO	t	2026-02-11 17:53:53.364	2026-02-11 17:53:53.364	\N	\N
6	BOSCH	BOSCH	t	2026-02-11 17:53:53.682	2026-02-11 17:53:53.682	\N	\N
7	JADEVER	JADEVER	t	2026-02-11 17:53:53.905	2026-02-11 17:53:53.905	\N	\N
8	WADFFO	WADFFO	t	2026-02-11 17:53:54.124	2026-02-11 17:53:54.124	\N	\N
9	APT	APT	t	2026-02-11 17:53:54.35	2026-02-11 17:53:54.35	\N	\N
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, type, tax_number, address, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: goods_receipt_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goods_receipt_lines (id, goods_receipt_id, product_id, qty, cost) FROM stdin;
\.


--
-- Data for Name: goods_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goods_receipts (id, grn_no, supplier_id, branch_id, related_po_id, payment_term, subtotal, tax_rate, tax_amount, total, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: item_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_types (id, subcategory_id, name, name_ar, active, created_at, updated_at, default_retail_margin, default_wholesale_margin) FROM stdin;
1	1	شنيور	شنيور	t	2026-02-11 17:53:52.264	2026-02-11 17:53:52.264	\N	\N
2	1	وهيلتي	وهيلتي	t	2026-02-11 17:53:52.291	2026-02-11 17:53:52.291	\N	\N
3	1	بلاور	بلاور	t	2026-02-11 17:53:52.299	2026-02-11 17:53:52.299	\N	\N
4	1	تسخين هوت جن	تسخين هوت جن	t	2026-02-11 17:53:52.307	2026-02-11 17:53:52.307	\N	\N
5	1	دهانات	دهانات	t	2026-02-11 17:53:52.316	2026-02-11 17:53:52.316	\N	\N
6	1	صاروخ	صاروخ	t	2026-02-11 17:53:52.318	2026-02-11 17:53:52.318	\N	\N
7	1	اركت	اركت	t	2026-02-11 17:53:52.332	2026-02-11 17:53:52.332	\N	\N
8	1	راوتر	راوتر	t	2026-02-11 17:53:52.338	2026-02-11 17:53:52.338	\N	\N
9	1	صنية	صنية	t	2026-02-11 17:53:52.341	2026-02-11 17:53:52.341	\N	\N
10	1	ديسك	ديسك	t	2026-02-11 17:53:52.344	2026-02-11 17:53:52.344	\N	\N
11	1	فارة	فارة	t	2026-02-11 17:53:52.347	2026-02-11 17:53:52.347	\N	\N
12	1	صنفرة	صنفرة	t	2026-02-11 17:53:52.35	2026-02-11 17:53:52.35	\N	\N
13	1	ماكن جلخ	ماكن جلخ	t	2026-02-11 17:53:52.357	2026-02-11 17:53:52.357	\N	\N
14	1	ماكن لحام  قصدير	ماكن لحام  قصدير	t	2026-02-11 17:53:52.361	2026-02-11 17:53:52.361	\N	\N
15	1	ماكن لحام  بولي	ماكن لحام  بولي	t	2026-02-11 17:53:52.368	2026-02-11 17:53:52.368	\N	\N
16	1	ماكن لحام حديد	ماكن لحام حديد	t	2026-02-11 17:53:52.37	2026-02-11 17:53:52.37	\N	\N
17	2	مفكات	مفكات	t	2026-02-11 17:53:52.378	2026-02-11 17:53:52.378	\N	\N
18	2	ماكن سيراميك	ماكن سيراميك	t	2026-02-11 17:53:52.407	2026-02-11 17:53:52.407	\N	\N
19	2	لقم ويد سيستم	لقم ويد سيستم	t	2026-02-11 17:53:52.412	2026-02-11 17:53:52.412	\N	\N
20	2	بنس كماشة فرنساوي انجليزي	بنس كماشة فرنساوي انجليزي	t	2026-02-11 17:53:52.428	2026-02-11 17:53:52.428	\N	\N
21	2	اطقم عده	اطقم عده	t	2026-02-11 17:53:52.466	2026-02-11 17:53:52.466	\N	\N
22	2	شاكوش ومطرقة	شاكوش ومطرقة	t	2026-02-11 17:53:52.478	2026-02-11 17:53:52.478	\N	\N
23	2	اطقم الن وبيبه	اطقم الن وبيبه	t	2026-02-11 17:53:52.486	2026-02-11 17:53:52.486	\N	\N
24	2	شنط عده	شنط عده	t	2026-02-11 17:53:52.492	2026-02-11 17:53:52.492	\N	\N
25	2	قمطة وزرجينة ومنجلة	قمطة وزرجينة ومنجلة	t	2026-02-11 17:53:52.511	2026-02-11 17:53:52.511	\N	\N
26	2	اجنة ومسمار يدوي	اجنة ومسمار يدوي	t	2026-02-11 17:53:52.516	2026-02-11 17:53:52.516	\N	\N
27	2	مسدس سليكون	مسدس سليكون	t	2026-02-11 17:53:52.529	2026-02-11 17:53:52.529	\N	\N
28	2	منشار خشابي وحدادي	منشار خشابي وحدادي	t	2026-02-11 17:53:52.536	2026-02-11 17:53:52.536	\N	\N
29	2	قطرات	قطرات	t	2026-02-11 17:53:52.542	2026-02-11 17:53:52.542	\N	\N
30	2	مفاتيح	مفاتيح	t	2026-02-11 17:53:52.545	2026-02-11 17:53:52.545	\N	\N
31	2	بوكليز	بوكليز	t	2026-02-11 17:53:52.552	2026-02-11 17:53:52.552	\N	\N
32	2	جوانتي	جوانتي	t	2026-02-11 17:53:52.555	2026-02-11 17:53:52.555	\N	\N
33	2	نظارت	نظارت	t	2026-02-11 17:53:52.559	2026-02-11 17:53:52.559	\N	\N
34	2	ادوات سيارات	ادوات سيارات	t	2026-02-11 17:53:52.562	2026-02-11 17:53:52.562	\N	\N
35	2	ازميل	ازميل	t	2026-02-11 17:53:52.581	2026-02-11 17:53:52.581	\N	\N
36	2	مقصات	مقصات	t	2026-02-11 17:53:52.586	2026-02-11 17:53:52.586	\N	\N
37	2	دباسة خشب	دباسة خشب	t	2026-02-11 17:53:52.594	2026-02-11 17:53:52.594	\N	\N
38	2	ادوات دهانات	ادوات دهانات	t	2026-02-11 17:53:52.595	2026-02-11 17:53:52.595	\N	\N
39	3	بنط	بنط	t	2026-02-11 17:53:52.602	2026-02-11 17:53:52.602	\N	\N
40	3	قطع غيار	قطع غيار	t	2026-02-11 17:53:52.641	2026-02-11 17:53:52.641	\N	\N
41	3	صنية والماظة	صنية والماظة	t	2026-02-11 17:53:52.652	2026-02-11 17:53:52.652	\N	\N
42	3	سلاح اركت	سلاح اركت	t	2026-02-11 17:53:52.664	2026-02-11 17:53:52.664	\N	\N
43	3	احجار	احجار	t	2026-02-11 17:53:52.668	2026-02-11 17:53:52.668	\N	\N
44	3	صنفرة وادوات ماكن لحام	صنفرة وادوات ماكن لحام	t	2026-02-11 17:53:52.669	2026-02-11 17:53:52.669	\N	\N
45	3	فرش	فرش	t	2026-02-11 17:53:52.672	2026-02-11 17:53:52.672	\N	\N
46	4	اطقم كومبو	اطقم كومبو	t	2026-02-11 17:53:52.676	2026-02-11 17:53:52.676	\N	\N
47	4	شنيور وهيلتي ودريل	شنيور وهيلتي ودريل	t	2026-02-11 17:53:52.684	2026-02-11 17:53:52.684	\N	\N
48	4	دهانات	دهانات	t	2026-02-11 17:53:52.738	2026-02-11 17:53:52.738	\N	\N
49	4	بلاور وتسخين	بلاور وتسخين	t	2026-02-11 17:53:52.743	2026-02-11 17:53:52.743	\N	\N
50	4	كشافات	كشافات	t	2026-02-11 17:53:52.752	2026-02-11 17:53:52.752	\N	\N
51	4	صاروخ	صاروخ	t	2026-02-11 17:53:52.759	2026-02-11 17:53:52.759	\N	\N
52	4	صنية	صنية	t	2026-02-11 17:53:52.779	2026-02-11 17:53:52.779	\N	\N
53	5	رشاشات	رشاشات	t	2026-02-11 17:53:52.782	2026-02-11 17:53:52.782	\N	\N
54	5	خراطيم	خراطيم	t	2026-02-11 17:53:52.8	2026-02-11 17:53:52.8	\N	\N
55	5	مقصات زرع	مقصات زرع	t	2026-02-11 17:53:52.801	2026-02-11 17:53:52.801	\N	\N
56	5	ادوات زراعة	ادوات زراعة	t	2026-02-11 17:53:52.802	2026-02-11 17:53:52.802	\N	\N
57	5	ماكن قص نجيلة	ماكن قص نجيلة	t	2026-02-11 17:53:52.808	2026-02-11 17:53:52.808	\N	\N
58	5	ماكن غسيل	ماكن غسيل	t	2026-02-11 17:53:52.811	2026-02-11 17:53:52.811	\N	\N
59	5	مناشير زراعية	مناشير زراعية	t	2026-02-11 17:53:52.828	2026-02-11 17:53:52.828	\N	\N
60	6	امتار يدوي	امتار يدوي	t	2026-02-11 17:53:52.841	2026-02-11 17:53:52.841	\N	\N
61	6	امتار ليزر	امتار ليزر	t	2026-02-11 17:53:52.847	2026-02-11 17:53:52.847	\N	\N
62	6	ميزان مياه	ميزان مياه	t	2026-02-11 17:53:52.849	2026-02-11 17:53:52.849	\N	\N
63	6	ميزان ليزر	ميزان ليزر	t	2026-02-11 17:53:52.853	2026-02-11 17:53:52.853	\N	\N
64	6	زاوية علام	زاوية علام	t	2026-02-11 17:53:52.854	2026-02-11 17:53:52.854	\N	\N
65	7	دباسات	دباسات	t	2026-02-11 17:53:52.857	2026-02-11 17:53:52.857	\N	\N
66	7	دريل	دريل	t	2026-02-11 17:53:52.859	2026-02-11 17:53:52.859	\N	\N
67	7	دهانات	دهانات	t	2026-02-11 17:53:52.86	2026-02-11 17:53:52.86	\N	\N
68	7	موازين	موازين	t	2026-02-11 17:53:52.879	2026-02-11 17:53:52.879	\N	\N
69	7	بطاريات حجر	بطاريات حجر	t	2026-02-11 17:53:52.881	2026-02-11 17:53:52.881	\N	\N
70	7	مكبس هيدروليك	مكبس هيدروليك	t	2026-02-11 17:53:52.884	2026-02-11 17:53:52.884	\N	\N
71	7	مواتير مياه	مواتير مياه	t	2026-02-11 17:53:52.887	2026-02-11 17:53:52.887	\N	\N
72	8	شنيور	شنيور	t	2026-02-11 17:53:52.955	2026-02-11 17:53:52.955	\N	\N
73	8	وهيلتي	وهيلتي	t	2026-02-11 17:53:52.966	2026-02-11 17:53:52.966	\N	\N
74	8	بلاور	بلاور	t	2026-02-11 17:53:52.985	2026-02-11 17:53:52.985	\N	\N
75	8	تسخين هوت جن	تسخين هوت جن	t	2026-02-11 17:53:52.989	2026-02-11 17:53:52.989	\N	\N
76	8	دهانات	دهانات	t	2026-02-11 17:53:52.996	2026-02-11 17:53:52.996	\N	\N
77	8	صاروخ	صاروخ	t	2026-02-11 17:53:52.998	2026-02-11 17:53:52.998	\N	\N
78	8	اركت	اركت	t	2026-02-11 17:53:53.016	2026-02-11 17:53:53.016	\N	\N
79	8	راوتر	راوتر	t	2026-02-11 17:53:53.024	2026-02-11 17:53:53.024	\N	\N
80	8	صنية	صنية	t	2026-02-11 17:53:53.027	2026-02-11 17:53:53.027	\N	\N
81	8	ديسك	ديسك	t	2026-02-11 17:53:53.033	2026-02-11 17:53:53.033	\N	\N
82	8	فارة	فارة	t	2026-02-11 17:53:53.038	2026-02-11 17:53:53.038	\N	\N
83	8	صنفرة	صنفرة	t	2026-02-11 17:53:53.043	2026-02-11 17:53:53.043	\N	\N
84	8	ماكن جلخ	ماكن جلخ	t	2026-02-11 17:53:53.051	2026-02-11 17:53:53.051	\N	\N
85	8	ماكن لحام  قصدير	ماكن لحام  قصدير	t	2026-02-11 17:53:53.052	2026-02-11 17:53:53.052	\N	\N
86	8	ماكن لحام  بولي	ماكن لحام  بولي	t	2026-02-11 17:53:53.054	2026-02-11 17:53:53.054	\N	\N
87	8	ماكن لحام حديد	ماكن لحام حديد	t	2026-02-11 17:53:53.056	2026-02-11 17:53:53.056	\N	\N
88	9	مفكات	مفكات	t	2026-02-11 17:53:53.058	2026-02-11 17:53:53.058	\N	\N
89	9	ماكن سيراميك	ماكن سيراميك	t	2026-02-11 17:53:53.085	2026-02-11 17:53:53.085	\N	\N
90	9	لقم ويد سيستم	لقم ويد سيستم	t	2026-02-11 17:53:53.086	2026-02-11 17:53:53.086	\N	\N
91	9	بنس كماشة فرنساوي انجليزي	بنس كماشة فرنساوي انجليزي	t	2026-02-11 17:53:53.088	2026-02-11 17:53:53.088	\N	\N
92	9	اطقم عده	اطقم عده	t	2026-02-11 17:53:53.117	2026-02-11 17:53:53.117	\N	\N
93	9	شاكوش ومطرقة	شاكوش ومطرقة	t	2026-02-11 17:53:53.121	2026-02-11 17:53:53.121	\N	\N
94	9	اطقم الن وبيبه	اطقم الن وبيبه	t	2026-02-11 17:53:53.145	2026-02-11 17:53:53.145	\N	\N
95	9	شنط عده	شنط عده	t	2026-02-11 17:53:53.148	2026-02-11 17:53:53.148	\N	\N
96	9	قمطة وزرجينة ومنجلة	قمطة وزرجينة ومنجلة	t	2026-02-11 17:53:53.149	2026-02-11 17:53:53.149	\N	\N
97	9	اجنة ومسمار يدوي	اجنة ومسمار يدوي	t	2026-02-11 17:53:53.15	2026-02-11 17:53:53.15	\N	\N
98	9	مسدس سليكون	مسدس سليكون	t	2026-02-11 17:53:53.151	2026-02-11 17:53:53.151	\N	\N
99	9	مسدس شمع	مسدس شمع	t	2026-02-11 17:53:53.152	2026-02-11 17:53:53.152	\N	\N
100	9	منشار خشابي وحدادي	منشار خشابي وحدادي	t	2026-02-11 17:53:53.155	2026-02-11 17:53:53.155	\N	\N
101	9	قطرات	قطرات	t	2026-02-11 17:53:53.158	2026-02-11 17:53:53.158	\N	\N
102	9	مفاتيح	مفاتيح	t	2026-02-11 17:53:53.162	2026-02-11 17:53:53.162	\N	\N
103	9	بوكليز	بوكليز	t	2026-02-11 17:53:53.166	2026-02-11 17:53:53.166	\N	\N
104	9	جوانتي	جوانتي	t	2026-02-11 17:53:53.168	2026-02-11 17:53:53.168	\N	\N
105	9	نظارت	نظارت	t	2026-02-11 17:53:53.169	2026-02-11 17:53:53.169	\N	\N
106	9	ادوات سيارات	ادوات سيارات	t	2026-02-11 17:53:53.17	2026-02-11 17:53:53.17	\N	\N
107	9	ازميل	ازميل	t	2026-02-11 17:53:53.178	2026-02-11 17:53:53.178	\N	\N
108	9	مقصات	مقصات	t	2026-02-11 17:53:53.179	2026-02-11 17:53:53.179	\N	\N
109	9	دباسة خشب	دباسة خشب	t	2026-02-11 17:53:53.188	2026-02-11 17:53:53.188	\N	\N
110	9	ادوات دهانات	ادوات دهانات	t	2026-02-11 17:53:53.189	2026-02-11 17:53:53.189	\N	\N
111	10	بنط	بنط	t	2026-02-11 17:53:53.191	2026-02-11 17:53:53.191	\N	\N
112	10	قطع غيار	قطع غيار	t	2026-02-11 17:53:53.192	2026-02-11 17:53:53.192	\N	\N
113	10	صنية والماظة	صنية والماظة	t	2026-02-11 17:53:53.194	2026-02-11 17:53:53.194	\N	\N
114	10	سلاح اركت	سلاح اركت	t	2026-02-11 17:53:53.208	2026-02-11 17:53:53.208	\N	\N
115	10	احجار	احجار	t	2026-02-11 17:53:53.209	2026-02-11 17:53:53.209	\N	\N
116	10	صنفرة وادوات ماكن لحام	صنفرة وادوات ماكن لحام	t	2026-02-11 17:53:53.212	2026-02-11 17:53:53.212	\N	\N
117	10	فرش	فرش	t	2026-02-11 17:53:53.213	2026-02-11 17:53:53.213	\N	\N
118	11	اطقم كومبو	اطقم كومبو	t	2026-02-11 17:53:53.217	2026-02-11 17:53:53.217	\N	\N
119	11	شنيور وهيلتي ودريل	شنيور وهيلتي ودريل	t	2026-02-11 17:53:53.219	2026-02-11 17:53:53.219	\N	\N
120	11	دهانات	دهانات	t	2026-02-11 17:53:53.233	2026-02-11 17:53:53.233	\N	\N
121	11	بلاور وتسخين	بلاور وتسخين	t	2026-02-11 17:53:53.234	2026-02-11 17:53:53.234	\N	\N
122	11	كشافات	كشافات	t	2026-02-11 17:53:53.235	2026-02-11 17:53:53.235	\N	\N
123	11	صاروخ	صاروخ	t	2026-02-11 17:53:53.236	2026-02-11 17:53:53.236	\N	\N
124	11	صنية	صنية	t	2026-02-11 17:53:53.239	2026-02-11 17:53:53.239	\N	\N
125	12	رشاشات	رشاشات	t	2026-02-11 17:53:53.241	2026-02-11 17:53:53.241	\N	\N
126	12	خراطيم	خراطيم	t	2026-02-11 17:53:53.242	2026-02-11 17:53:53.242	\N	\N
127	12	مقصات زرع	مقصات زرع	t	2026-02-11 17:53:53.254	2026-02-11 17:53:53.254	\N	\N
128	12	ادوات زراعة	ادوات زراعة	t	2026-02-11 17:53:53.255	2026-02-11 17:53:53.255	\N	\N
129	12	ماكن قص نجيلة	ماكن قص نجيلة	t	2026-02-11 17:53:53.262	2026-02-11 17:53:53.262	\N	\N
130	12	ماكن غسيل	ماكن غسيل	t	2026-02-11 17:53:53.263	2026-02-11 17:53:53.263	\N	\N
131	12	مناشير زراعية	مناشير زراعية	t	2026-02-11 17:53:53.272	2026-02-11 17:53:53.272	\N	\N
132	13	امتار يدوي	امتار يدوي	t	2026-02-11 17:53:53.275	2026-02-11 17:53:53.275	\N	\N
133	13	امتار ليزر	امتار ليزر	t	2026-02-11 17:53:53.289	2026-02-11 17:53:53.289	\N	\N
134	13	ميزان مياه	ميزان مياه	t	2026-02-11 17:53:53.29	2026-02-11 17:53:53.29	\N	\N
135	13	ميزان ليزر	ميزان ليزر	t	2026-02-11 17:53:53.294	2026-02-11 17:53:53.294	\N	\N
136	13	زاوية علام	زاوية علام	t	2026-02-11 17:53:53.3	2026-02-11 17:53:53.3	\N	\N
137	14	دباسات	دباسات	t	2026-02-11 17:53:53.308	2026-02-11 17:53:53.308	\N	\N
138	14	دريل	دريل	t	2026-02-11 17:53:53.309	2026-02-11 17:53:53.309	\N	\N
139	14	دهانات	دهانات	t	2026-02-11 17:53:53.31	2026-02-11 17:53:53.31	\N	\N
140	19	شنيور	شنيور	t	2026-02-11 17:53:53.367	2026-02-11 17:53:53.367	\N	\N
141	19	وهيلتي	وهيلتي	t	2026-02-11 17:53:53.38	2026-02-11 17:53:53.38	\N	\N
142	19	بلاور	بلاور	t	2026-02-11 17:53:53.387	2026-02-11 17:53:53.387	\N	\N
143	19	تسخين هوت جن	تسخين هوت جن	t	2026-02-11 17:53:53.393	2026-02-11 17:53:53.393	\N	\N
144	19	دهانات	دهانات	t	2026-02-11 17:53:53.4	2026-02-11 17:53:53.4	\N	\N
145	19	صاروخ	صاروخ	t	2026-02-11 17:53:53.407	2026-02-11 17:53:53.407	\N	\N
146	19	اركت	اركت	t	2026-02-11 17:53:53.418	2026-02-11 17:53:53.418	\N	\N
147	19	راوتر	راوتر	t	2026-02-11 17:53:53.423	2026-02-11 17:53:53.423	\N	\N
148	19	صنية	صنية	t	2026-02-11 17:53:53.426	2026-02-11 17:53:53.426	\N	\N
149	19	ديسك	ديسك	t	2026-02-11 17:53:53.428	2026-02-11 17:53:53.428	\N	\N
150	19	فارة	فارة	t	2026-02-11 17:53:53.43	2026-02-11 17:53:53.43	\N	\N
151	19	صنفرة	صنفرة	t	2026-02-11 17:53:53.432	2026-02-11 17:53:53.432	\N	\N
152	19	ماكن جلخ	ماكن جلخ	t	2026-02-11 17:53:53.433	2026-02-11 17:53:53.433	\N	\N
153	19	ماكن لحام  قصدير	ماكن لحام  قصدير	t	2026-02-11 17:53:53.434	2026-02-11 17:53:53.434	\N	\N
154	19	ماكن لحام  بولي	ماكن لحام  بولي	t	2026-02-11 17:53:53.435	2026-02-11 17:53:53.435	\N	\N
155	19	ماكن لحام حديد	ماكن لحام حديد	t	2026-02-11 17:53:53.436	2026-02-11 17:53:53.436	\N	\N
156	20	مفكات	مفكات	t	2026-02-11 17:53:53.439	2026-02-11 17:53:53.439	\N	\N
157	20	ماكن سيراميك	ماكن سيراميك	t	2026-02-11 17:53:53.453	2026-02-11 17:53:53.453	\N	\N
158	20	لقم ويد سيستم	لقم ويد سيستم	t	2026-02-11 17:53:53.457	2026-02-11 17:53:53.457	\N	\N
159	20	بنس كماشة فرنساوي انجليزي	بنس كماشة فرنساوي انجليزي	t	2026-02-11 17:53:53.466	2026-02-11 17:53:53.466	\N	\N
160	20	اطقم عده	اطقم عده	t	2026-02-11 17:53:53.494	2026-02-11 17:53:53.494	\N	\N
161	20	شاكوش ومطرقة	شاكوش ومطرقة	t	2026-02-11 17:53:53.497	2026-02-11 17:53:53.497	\N	\N
162	20	اطقم الن وبيبه	اطقم الن وبيبه	t	2026-02-11 17:53:53.5	2026-02-11 17:53:53.5	\N	\N
163	20	شنط عده	شنط عده	t	2026-02-11 17:53:53.501	2026-02-11 17:53:53.501	\N	\N
164	20	قمطة وزرجينة ومنجلة	قمطة وزرجينة ومنجلة	t	2026-02-11 17:53:53.505	2026-02-11 17:53:53.505	\N	\N
165	20	اجنة ومسمار يدوي	اجنة ومسمار يدوي	t	2026-02-11 17:53:53.506	2026-02-11 17:53:53.506	\N	\N
166	20	مسدس سليكون	مسدس سليكون	t	2026-02-11 17:53:53.507	2026-02-11 17:53:53.507	\N	\N
167	20	منشار خشابي وحدادي	منشار خشابي وحدادي	t	2026-02-11 17:53:53.51	2026-02-11 17:53:53.51	\N	\N
168	20	قطرات	قطرات	t	2026-02-11 17:53:53.511	2026-02-11 17:53:53.511	\N	\N
169	20	مفاتيح	مفاتيح	t	2026-02-11 17:53:53.519	2026-02-11 17:53:53.519	\N	\N
170	20	بوكليز	بوكليز	t	2026-02-11 17:53:53.522	2026-02-11 17:53:53.522	\N	\N
171	20	جوانتي	جوانتي	t	2026-02-11 17:53:53.523	2026-02-11 17:53:53.523	\N	\N
172	20	نظارت	نظارت	t	2026-02-11 17:53:53.526	2026-02-11 17:53:53.526	\N	\N
173	20	ادوات سيارات	ادوات سيارات	t	2026-02-11 17:53:53.527	2026-02-11 17:53:53.527	\N	\N
174	20	ازميل	ازميل	t	2026-02-11 17:53:53.535	2026-02-11 17:53:53.535	\N	\N
175	20	مقصات	مقصات	t	2026-02-11 17:53:53.536	2026-02-11 17:53:53.536	\N	\N
176	20	دباسة خشب	دباسة خشب	t	2026-02-11 17:53:53.54	2026-02-11 17:53:53.54	\N	\N
177	20	ادوات دهانات	ادوات دهانات	t	2026-02-11 17:53:53.541	2026-02-11 17:53:53.541	\N	\N
178	21	بنط	بنط	t	2026-02-11 17:53:53.543	2026-02-11 17:53:53.543	\N	\N
179	21	قطع غيار	قطع غيار	t	2026-02-11 17:53:53.546	2026-02-11 17:53:53.546	\N	\N
180	21	صنية والماظة	صنية والماظة	t	2026-02-11 17:53:53.555	2026-02-11 17:53:53.555	\N	\N
181	21	سلاح اركت	سلاح اركت	t	2026-02-11 17:53:53.563	2026-02-11 17:53:53.563	\N	\N
182	21	احجار	احجار	t	2026-02-11 17:53:53.564	2026-02-11 17:53:53.564	\N	\N
183	21	صنفرة وادوات ماكن لحام	صنفرة وادوات ماكن لحام	t	2026-02-11 17:53:53.565	2026-02-11 17:53:53.565	\N	\N
184	21	فرش	فرش	t	2026-02-11 17:53:53.566	2026-02-11 17:53:53.566	\N	\N
185	22	اطقم كومبو	اطقم كومبو	t	2026-02-11 17:53:53.568	2026-02-11 17:53:53.568	\N	\N
186	22	شنيور وهيلتي ودريل	شنيور وهيلتي ودريل	t	2026-02-11 17:53:53.574	2026-02-11 17:53:53.574	\N	\N
187	22	دهانات	دهانات	t	2026-02-11 17:53:53.587	2026-02-11 17:53:53.587	\N	\N
188	22	بلاور وتسخين	بلاور وتسخين	t	2026-02-11 17:53:53.588	2026-02-11 17:53:53.588	\N	\N
189	22	كشافات	كشافات	t	2026-02-11 17:53:53.594	2026-02-11 17:53:53.594	\N	\N
190	22	صاروخ	صاروخ	t	2026-02-11 17:53:53.595	2026-02-11 17:53:53.595	\N	\N
191	22	صنية	صنية	t	2026-02-11 17:53:53.596	2026-02-11 17:53:53.596	\N	\N
192	23	رشاشات	رشاشات	t	2026-02-11 17:53:53.598	2026-02-11 17:53:53.598	\N	\N
193	23	خراطيم	خراطيم	t	2026-02-11 17:53:53.602	2026-02-11 17:53:53.602	\N	\N
194	23	مقصات زرع	مقصات زرع	t	2026-02-11 17:53:53.603	2026-02-11 17:53:53.603	\N	\N
195	23	ادوات زراعة	ادوات زراعة	t	2026-02-11 17:53:53.604	2026-02-11 17:53:53.604	\N	\N
196	23	ماكن قص نجيلة	ماكن قص نجيلة	t	2026-02-11 17:53:53.605	2026-02-11 17:53:53.605	\N	\N
197	23	ماكن غسيل	ماكن غسيل	t	2026-02-11 17:53:53.606	2026-02-11 17:53:53.606	\N	\N
198	23	مناشير زراعية	مناشير زراعية	t	2026-02-11 17:53:53.612	2026-02-11 17:53:53.612	\N	\N
199	24	امتار يدوي	امتار يدوي	t	2026-02-11 17:53:53.614	2026-02-11 17:53:53.614	\N	\N
200	24	امتار ليزر	امتار ليزر	t	2026-02-11 17:53:53.628	2026-02-11 17:53:53.628	\N	\N
201	24	ميزان مياه	ميزان مياه	t	2026-02-11 17:53:53.63	2026-02-11 17:53:53.63	\N	\N
202	24	ميزان ليزر	ميزان ليزر	t	2026-02-11 17:53:53.632	2026-02-11 17:53:53.632	\N	\N
203	24	زاوية علام	زاوية علام	t	2026-02-11 17:53:53.634	2026-02-11 17:53:53.634	\N	\N
204	25	دباسات	دباسات	t	2026-02-11 17:53:53.639	2026-02-11 17:53:53.639	\N	\N
205	25	دريل	دريل	t	2026-02-11 17:53:53.642	2026-02-11 17:53:53.642	\N	\N
206	25	دهانات	دهانات	t	2026-02-11 17:53:53.643	2026-02-11 17:53:53.643	\N	\N
207	30	شنيور	شنيور	t	2026-02-11 17:53:53.684	2026-02-11 17:53:53.684	\N	\N
208	30	وهيلتي	وهيلتي	t	2026-02-11 17:53:53.69	2026-02-11 17:53:53.69	\N	\N
209	30	بلاور	بلاور	t	2026-02-11 17:53:53.699	2026-02-11 17:53:53.699	\N	\N
210	30	تسخين هوت جن	تسخين هوت جن	t	2026-02-11 17:53:53.705	2026-02-11 17:53:53.705	\N	\N
211	30	صاروخ	صاروخ	t	2026-02-11 17:53:53.708	2026-02-11 17:53:53.708	\N	\N
212	30	اركت	اركت	t	2026-02-11 17:53:53.718	2026-02-11 17:53:53.718	\N	\N
213	30	راوتر	راوتر	t	2026-02-11 17:53:53.721	2026-02-11 17:53:53.721	\N	\N
214	30	صنية	صنية	t	2026-02-11 17:53:53.722	2026-02-11 17:53:53.722	\N	\N
215	30	ديسك	ديسك	t	2026-02-11 17:53:53.723	2026-02-11 17:53:53.723	\N	\N
216	30	فارة	فارة	t	2026-02-11 17:53:53.725	2026-02-11 17:53:53.725	\N	\N
217	30	صنفرة	صنفرة	t	2026-02-11 17:53:53.727	2026-02-11 17:53:53.727	\N	\N
218	30	ماكن جلخ	ماكن جلخ	t	2026-02-11 17:53:53.731	2026-02-11 17:53:53.731	\N	\N
219	30	ماكن لحام  قصدير	ماكن لحام  قصدير	t	2026-02-11 17:53:53.732	2026-02-11 17:53:53.732	\N	\N
220	30	ماكن لحام  بولي	ماكن لحام  بولي	t	2026-02-11 17:53:53.733	2026-02-11 17:53:53.733	\N	\N
221	30	ماكن لحام حديد	ماكن لحام حديد	t	2026-02-11 17:53:53.734	2026-02-11 17:53:53.734	\N	\N
222	31	مفكات	مفكات	t	2026-02-11 17:53:53.738	2026-02-11 17:53:53.738	\N	\N
223	31	لقم ويد سيستم	لقم ويد سيستم	t	2026-02-11 17:53:53.74	2026-02-11 17:53:53.74	\N	\N
224	31	بنس	بنس	t	2026-02-11 17:53:53.741	2026-02-11 17:53:53.741	\N	\N
225	31	اطقم عده	اطقم عده	t	2026-02-11 17:53:53.743	2026-02-11 17:53:53.743	\N	\N
226	31	شاكوش ومطرقة	شاكوش ومطرقة	t	2026-02-11 17:53:53.744	2026-02-11 17:53:53.744	\N	\N
227	31	اطقم الن	اطقم الن	t	2026-02-11 17:53:53.745	2026-02-11 17:53:53.745	\N	\N
228	31	شنط عده	شنط عده	t	2026-02-11 17:53:53.746	2026-02-11 17:53:53.746	\N	\N
229	31	قمطة وزرجينة	قمطة وزرجينة	t	2026-02-11 17:53:53.747	2026-02-11 17:53:53.747	\N	\N
230	31	اجنة ومسمار يدوي	اجنة ومسمار يدوي	t	2026-02-11 17:53:53.748	2026-02-11 17:53:53.748	\N	\N
231	31	منشار خشابي وحدادي	منشار خشابي وحدادي	t	2026-02-11 17:53:53.749	2026-02-11 17:53:53.749	\N	\N
232	31	قطرات	قطرات	t	2026-02-11 17:53:53.75	2026-02-11 17:53:53.75	\N	\N
233	31	مفاتيح	مفاتيح	t	2026-02-11 17:53:53.751	2026-02-11 17:53:53.751	\N	\N
234	31	بوكليز	بوكليز	t	2026-02-11 17:53:53.752	2026-02-11 17:53:53.752	\N	\N
235	31	جوانتي	جوانتي	t	2026-02-11 17:53:53.753	2026-02-11 17:53:53.753	\N	\N
236	31	ادوات سيارات	ادوات سيارات	t	2026-02-11 17:53:53.754	2026-02-11 17:53:53.754	\N	\N
237	31	ازميل	ازميل	t	2026-02-11 17:53:53.755	2026-02-11 17:53:53.755	\N	\N
238	31	مقصات	مقصات	t	2026-02-11 17:53:53.756	2026-02-11 17:53:53.756	\N	\N
239	31	دباسة خشب	دباسة خشب	t	2026-02-11 17:53:53.757	2026-02-11 17:53:53.757	\N	\N
240	31	ادوات دهانات	ادوات دهانات	t	2026-02-11 17:53:53.759	2026-02-11 17:53:53.759	\N	\N
241	32	بنط	بنط	t	2026-02-11 17:53:53.761	2026-02-11 17:53:53.761	\N	\N
242	32	قطع غيار	قطع غيار	t	2026-02-11 17:53:53.802	2026-02-11 17:53:53.802	\N	\N
243	32	صنية والماظة	صنية والماظة	t	2026-02-11 17:53:53.803	2026-02-11 17:53:53.803	\N	\N
244	32	احجار	احجار	t	2026-02-11 17:53:53.811	2026-02-11 17:53:53.811	\N	\N
245	32	صنفرة	صنفرة	t	2026-02-11 17:53:53.832	2026-02-11 17:53:53.832	\N	\N
246	32	فرش	فرش	t	2026-02-11 17:53:53.836	2026-02-11 17:53:53.836	\N	\N
247	33	شنيور وهيلتي	شنيور وهيلتي	t	2026-02-11 17:53:53.838	2026-02-11 17:53:53.838	\N	\N
248	33	بلاور وتسخين	بلاور وتسخين	t	2026-02-11 17:53:53.841	2026-02-11 17:53:53.841	\N	\N
249	33	صاروخ	صاروخ	t	2026-02-11 17:53:53.842	2026-02-11 17:53:53.842	\N	\N
250	33	صنية	صنية	t	2026-02-11 17:53:53.843	2026-02-11 17:53:53.843	\N	\N
251	34	رشاشات	رشاشات	t	2026-02-11 17:53:53.845	2026-02-11 17:53:53.845	\N	\N
252	34	خراطيم	خراطيم	t	2026-02-11 17:53:53.846	2026-02-11 17:53:53.846	\N	\N
253	34	مقصات زرع	مقصات زرع	t	2026-02-11 17:53:53.847	2026-02-11 17:53:53.847	\N	\N
254	34	ماكن قص نجيلة	ماكن قص نجيلة	t	2026-02-11 17:53:53.848	2026-02-11 17:53:53.848	\N	\N
255	34	ماكن غسيل	ماكن غسيل	t	2026-02-11 17:53:53.849	2026-02-11 17:53:53.849	\N	\N
256	34	مناشير زراعية	مناشير زراعية	t	2026-02-11 17:53:53.852	2026-02-11 17:53:53.852	\N	\N
257	35	امتار يدوي	امتار يدوي	t	2026-02-11 17:53:53.855	2026-02-11 17:53:53.855	\N	\N
258	35	امتار ليزر	امتار ليزر	t	2026-02-11 17:53:53.856	2026-02-11 17:53:53.856	\N	\N
259	35	ميزان مياه	ميزان مياه	t	2026-02-11 17:53:53.86	2026-02-11 17:53:53.86	\N	\N
260	35	ميزان ليزر	ميزان ليزر	t	2026-02-11 17:53:53.862	2026-02-11 17:53:53.862	\N	\N
261	35	زاوية علام	زاوية علام	t	2026-02-11 17:53:53.87	2026-02-11 17:53:53.87	\N	\N
262	36	دباسات	دباسات	t	2026-02-11 17:53:53.872	2026-02-11 17:53:53.872	\N	\N
263	36	دريل	دريل	t	2026-02-11 17:53:53.873	2026-02-11 17:53:53.873	\N	\N
264	37	شنيور	شنيور	t	2026-02-11 17:53:53.907	2026-02-11 17:53:53.907	\N	\N
265	37	وهيلتي	وهيلتي	t	2026-02-11 17:53:53.908	2026-02-11 17:53:53.908	\N	\N
266	37	بلاور	بلاور	t	2026-02-11 17:53:53.911	2026-02-11 17:53:53.911	\N	\N
267	37	تسخين هوت جن	تسخين هوت جن	t	2026-02-11 17:53:53.915	2026-02-11 17:53:53.915	\N	\N
268	37	دهانات	دهانات	t	2026-02-11 17:53:53.919	2026-02-11 17:53:53.919	\N	\N
269	37	صاروخ	صاروخ	t	2026-02-11 17:53:53.92	2026-02-11 17:53:53.92	\N	\N
270	37	اركت	اركت	t	2026-02-11 17:53:53.922	2026-02-11 17:53:53.922	\N	\N
271	37	راوتر	راوتر	t	2026-02-11 17:53:53.923	2026-02-11 17:53:53.923	\N	\N
272	37	صنية	صنية	t	2026-02-11 17:53:53.927	2026-02-11 17:53:53.927	\N	\N
273	37	ديسك	ديسك	t	2026-02-11 17:53:53.929	2026-02-11 17:53:53.929	\N	\N
274	37	فارة	فارة	t	2026-02-11 17:53:53.93	2026-02-11 17:53:53.93	\N	\N
275	37	صنفرة	صنفرة	t	2026-02-11 17:53:53.932	2026-02-11 17:53:53.932	\N	\N
276	37	ماكن جلخ	ماكن جلخ	t	2026-02-11 17:53:53.933	2026-02-11 17:53:53.933	\N	\N
277	37	ماكن لحام  قصدير	ماكن لحام  قصدير	t	2026-02-11 17:53:53.934	2026-02-11 17:53:53.934	\N	\N
278	37	ماكن لحام  بولي	ماكن لحام  بولي	t	2026-02-11 17:53:53.937	2026-02-11 17:53:53.937	\N	\N
279	37	ماكن لحام حديد	ماكن لحام حديد	t	2026-02-11 17:53:53.938	2026-02-11 17:53:53.938	\N	\N
280	38	مفكات	مفكات	t	2026-02-11 17:53:53.942	2026-02-11 17:53:53.942	\N	\N
281	38	ماكن سيراميك	ماكن سيراميك	t	2026-02-11 17:53:53.947	2026-02-11 17:53:53.947	\N	\N
282	38	لقم ويد سيستم	لقم ويد سيستم	t	2026-02-11 17:53:53.949	2026-02-11 17:53:53.949	\N	\N
283	38	بنس كماشة فرنساوي انجليزي	بنس كماشة فرنساوي انجليزي	t	2026-02-11 17:53:53.955	2026-02-11 17:53:53.955	\N	\N
284	38	اطقم عده	اطقم عده	t	2026-02-11 17:53:53.961	2026-02-11 17:53:53.961	\N	\N
285	38	شاكوش ومطرقة	شاكوش ومطرقة	t	2026-02-11 17:53:53.962	2026-02-11 17:53:53.962	\N	\N
286	38	اطقم الن وبيبه	اطقم الن وبيبه	t	2026-02-11 17:53:53.973	2026-02-11 17:53:53.973	\N	\N
287	38	شنط عده	شنط عده	t	2026-02-11 17:53:53.983	2026-02-11 17:53:53.983	\N	\N
288	38	قمطة وزرجينة ومنجلة	قمطة وزرجينة ومنجلة	t	2026-02-11 17:53:53.994	2026-02-11 17:53:53.994	\N	\N
289	38	اجنة ومسمار يدوي	اجنة ومسمار يدوي	t	2026-02-11 17:53:53.995	2026-02-11 17:53:53.995	\N	\N
290	38	مسدس سليكون	مسدس سليكون	t	2026-02-11 17:53:53.996	2026-02-11 17:53:53.996	\N	\N
291	38	مسدس شمع	مسدس شمع	t	2026-02-11 17:53:53.997	2026-02-11 17:53:53.997	\N	\N
292	38	منشار خشابي وحدادي	منشار خشابي وحدادي	t	2026-02-11 17:53:53.998	2026-02-11 17:53:53.998	\N	\N
293	38	قطرات	قطرات	t	2026-02-11 17:53:54.001	2026-02-11 17:53:54.001	\N	\N
294	38	مفاتيح	مفاتيح	t	2026-02-11 17:53:54.002	2026-02-11 17:53:54.002	\N	\N
295	38	بوكليز	بوكليز	t	2026-02-11 17:53:54.006	2026-02-11 17:53:54.006	\N	\N
296	38	جوانتي	جوانتي	t	2026-02-11 17:53:54.007	2026-02-11 17:53:54.007	\N	\N
297	38	نظارت	نظارت	t	2026-02-11 17:53:54.009	2026-02-11 17:53:54.009	\N	\N
298	38	ادوات سيارات	ادوات سيارات	t	2026-02-11 17:53:54.01	2026-02-11 17:53:54.01	\N	\N
299	38	ازميل	ازميل	t	2026-02-11 17:53:54.019	2026-02-11 17:53:54.019	\N	\N
300	38	مقصات	مقصات	t	2026-02-11 17:53:54.021	2026-02-11 17:53:54.021	\N	\N
301	38	دباسة خشب	دباسة خشب	t	2026-02-11 17:53:54.022	2026-02-11 17:53:54.022	\N	\N
302	38	ادوات دهانات	ادوات دهانات	t	2026-02-11 17:53:54.023	2026-02-11 17:53:54.023	\N	\N
303	39	بنط	بنط	t	2026-02-11 17:53:54.025	2026-02-11 17:53:54.025	\N	\N
304	39	قطع غيار	قطع غيار	t	2026-02-11 17:53:54.026	2026-02-11 17:53:54.026	\N	\N
305	39	صنية والماظة	صنية والماظة	t	2026-02-11 17:53:54.027	2026-02-11 17:53:54.027	\N	\N
306	39	سلاح اركت	سلاح اركت	t	2026-02-11 17:53:54.028	2026-02-11 17:53:54.028	\N	\N
307	39	احجار	احجار	t	2026-02-11 17:53:54.03	2026-02-11 17:53:54.03	\N	\N
308	39	صنفرة وادوات ماكن لحام	صنفرة وادوات ماكن لحام	t	2026-02-11 17:53:54.031	2026-02-11 17:53:54.031	\N	\N
309	39	فرش	فرش	t	2026-02-11 17:53:54.032	2026-02-11 17:53:54.032	\N	\N
310	40	اطقم كومبو	اطقم كومبو	t	2026-02-11 17:53:54.034	2026-02-11 17:53:54.034	\N	\N
311	40	شنيور وهيلتي ودريل	شنيور وهيلتي ودريل	t	2026-02-11 17:53:54.035	2026-02-11 17:53:54.035	\N	\N
312	40	دهانات	دهانات	t	2026-02-11 17:53:54.04	2026-02-11 17:53:54.04	\N	\N
313	40	بلاور وتسخين	بلاور وتسخين	t	2026-02-11 17:53:54.041	2026-02-11 17:53:54.041	\N	\N
314	40	كشافات	كشافات	t	2026-02-11 17:53:54.042	2026-02-11 17:53:54.042	\N	\N
315	40	صاروخ	صاروخ	t	2026-02-11 17:53:54.043	2026-02-11 17:53:54.043	\N	\N
316	40	صنية	صنية	t	2026-02-11 17:53:54.047	2026-02-11 17:53:54.047	\N	\N
317	41	رشاشات	رشاشات	t	2026-02-11 17:53:54.049	2026-02-11 17:53:54.049	\N	\N
318	41	خراطيم	خراطيم	t	2026-02-11 17:53:54.05	2026-02-11 17:53:54.05	\N	\N
319	41	مقصات زرع	مقصات زرع	t	2026-02-11 17:53:54.053	2026-02-11 17:53:54.053	\N	\N
320	41	ادوات زراعة	ادوات زراعة	t	2026-02-11 17:53:54.056	2026-02-11 17:53:54.056	\N	\N
321	41	ماكن قص نجيلة	ماكن قص نجيلة	t	2026-02-11 17:53:54.059	2026-02-11 17:53:54.059	\N	\N
322	41	ماكن غسيل	ماكن غسيل	t	2026-02-11 17:53:54.061	2026-02-11 17:53:54.061	\N	\N
323	41	مناشير زراعية	مناشير زراعية	t	2026-02-11 17:53:54.062	2026-02-11 17:53:54.062	\N	\N
324	42	امتار يدوي	امتار يدوي	t	2026-02-11 17:53:54.064	2026-02-11 17:53:54.064	\N	\N
325	42	امتار ليزر	امتار ليزر	t	2026-02-11 17:53:54.067	2026-02-11 17:53:54.067	\N	\N
326	42	ميزان مياه	ميزان مياه	t	2026-02-11 17:53:54.071	2026-02-11 17:53:54.071	\N	\N
327	42	ميزان ليزر	ميزان ليزر	t	2026-02-11 17:53:54.076	2026-02-11 17:53:54.076	\N	\N
328	42	زاوية علام	زاوية علام	t	2026-02-11 17:53:54.083	2026-02-11 17:53:54.083	\N	\N
329	43	دباسات	دباسات	t	2026-02-11 17:53:54.085	2026-02-11 17:53:54.085	\N	\N
330	43	دريل	دريل	t	2026-02-11 17:53:54.086	2026-02-11 17:53:54.086	\N	\N
331	43	دهانات	دهانات	t	2026-02-11 17:53:54.088	2026-02-11 17:53:54.088	\N	\N
332	48	شنيور	شنيور	t	2026-02-11 17:53:54.127	2026-02-11 17:53:54.127	\N	\N
333	48	وهيلتي	وهيلتي	t	2026-02-11 17:53:54.13	2026-02-11 17:53:54.13	\N	\N
334	48	بلاور	بلاور	t	2026-02-11 17:53:54.131	2026-02-11 17:53:54.131	\N	\N
335	48	تسخين هوت جن	تسخين هوت جن	t	2026-02-11 17:53:54.132	2026-02-11 17:53:54.132	\N	\N
336	48	صاروخ	صاروخ	t	2026-02-11 17:53:54.133	2026-02-11 17:53:54.133	\N	\N
337	48	اركت	اركت	t	2026-02-11 17:53:54.135	2026-02-11 17:53:54.135	\N	\N
338	48	راوتر	راوتر	t	2026-02-11 17:53:54.136	2026-02-11 17:53:54.136	\N	\N
339	48	صنية	صنية	t	2026-02-11 17:53:54.138	2026-02-11 17:53:54.138	\N	\N
340	48	ديسك	ديسك	t	2026-02-11 17:53:54.139	2026-02-11 17:53:54.139	\N	\N
341	48	فارة	فارة	t	2026-02-11 17:53:54.14	2026-02-11 17:53:54.14	\N	\N
342	48	صنفرة	صنفرة	t	2026-02-11 17:53:54.141	2026-02-11 17:53:54.141	\N	\N
343	48	ماكن جلخ	ماكن جلخ	t	2026-02-11 17:53:54.142	2026-02-11 17:53:54.142	\N	\N
344	48	ماكن لحام  قصدير	ماكن لحام  قصدير	t	2026-02-11 17:53:54.143	2026-02-11 17:53:54.143	\N	\N
345	48	ماكن لحام  بولي	ماكن لحام  بولي	t	2026-02-11 17:53:54.144	2026-02-11 17:53:54.144	\N	\N
346	48	ماكن لحام حديد	ماكن لحام حديد	t	2026-02-11 17:53:54.145	2026-02-11 17:53:54.145	\N	\N
347	49	مفكات	مفكات	t	2026-02-11 17:53:54.148	2026-02-11 17:53:54.148	\N	\N
348	49	لقم ويد سيستم	لقم ويد سيستم	t	2026-02-11 17:53:54.157	2026-02-11 17:53:54.157	\N	\N
349	49	بنس	بنس	t	2026-02-11 17:53:54.186	2026-02-11 17:53:54.186	\N	\N
350	49	اطقم عده	اطقم عده	t	2026-02-11 17:53:54.205	2026-02-11 17:53:54.205	\N	\N
351	49	شاكوش ومطرقة	شاكوش ومطرقة	t	2026-02-11 17:53:54.206	2026-02-11 17:53:54.206	\N	\N
352	49	اطقم الن	اطقم الن	t	2026-02-11 17:53:54.213	2026-02-11 17:53:54.213	\N	\N
353	49	شنط عده	شنط عده	t	2026-02-11 17:53:54.214	2026-02-11 17:53:54.214	\N	\N
354	49	قمطة وزرجينة	قمطة وزرجينة	t	2026-02-11 17:53:54.215	2026-02-11 17:53:54.215	\N	\N
355	49	اجنة ومسمار يدوي	اجنة ومسمار يدوي	t	2026-02-11 17:53:54.216	2026-02-11 17:53:54.216	\N	\N
356	49	منشار خشابي وحدادي	منشار خشابي وحدادي	t	2026-02-11 17:53:54.22	2026-02-11 17:53:54.22	\N	\N
357	49	قطرات	قطرات	t	2026-02-11 17:53:54.221	2026-02-11 17:53:54.221	\N	\N
358	49	مفاتيح	مفاتيح	t	2026-02-11 17:53:54.226	2026-02-11 17:53:54.226	\N	\N
359	49	بوكليز	بوكليز	t	2026-02-11 17:53:54.232	2026-02-11 17:53:54.232	\N	\N
360	49	جوانتي	جوانتي	t	2026-02-11 17:53:54.233	2026-02-11 17:53:54.233	\N	\N
361	49	ادوات سيارات	ادوات سيارات	t	2026-02-11 17:53:54.234	2026-02-11 17:53:54.234	\N	\N
362	49	ازميل	ازميل	t	2026-02-11 17:53:54.235	2026-02-11 17:53:54.235	\N	\N
363	49	مقصات	مقصات	t	2026-02-11 17:53:54.237	2026-02-11 17:53:54.237	\N	\N
364	49	دباسة خشب	دباسة خشب	t	2026-02-11 17:53:54.238	2026-02-11 17:53:54.238	\N	\N
365	49	ادوات دهانات	ادوات دهانات	t	2026-02-11 17:53:54.239	2026-02-11 17:53:54.239	\N	\N
366	50	بنط	بنط	t	2026-02-11 17:53:54.241	2026-02-11 17:53:54.241	\N	\N
367	50	قطع غيار	قطع غيار	t	2026-02-11 17:53:54.271	2026-02-11 17:53:54.271	\N	\N
368	50	صنية والماظة	صنية والماظة	t	2026-02-11 17:53:54.272	2026-02-11 17:53:54.272	\N	\N
369	50	احجار	احجار	t	2026-02-11 17:53:54.273	2026-02-11 17:53:54.273	\N	\N
370	50	صنفرة	صنفرة	t	2026-02-11 17:53:54.274	2026-02-11 17:53:54.274	\N	\N
371	50	فرش	فرش	t	2026-02-11 17:53:54.277	2026-02-11 17:53:54.277	\N	\N
372	51	شنيور وهيلتي	شنيور وهيلتي	t	2026-02-11 17:53:54.285	2026-02-11 17:53:54.285	\N	\N
373	51	بلاور وتسخين	بلاور وتسخين	t	2026-02-11 17:53:54.294	2026-02-11 17:53:54.294	\N	\N
374	51	صاروخ	صاروخ	t	2026-02-11 17:53:54.298	2026-02-11 17:53:54.298	\N	\N
375	51	صنية	صنية	t	2026-02-11 17:53:54.299	2026-02-11 17:53:54.299	\N	\N
376	52	رشاشات	رشاشات	t	2026-02-11 17:53:54.301	2026-02-11 17:53:54.301	\N	\N
377	52	خراطيم	خراطيم	t	2026-02-11 17:53:54.302	2026-02-11 17:53:54.302	\N	\N
378	52	مقصات زرع	مقصات زرع	t	2026-02-11 17:53:54.303	2026-02-11 17:53:54.303	\N	\N
379	52	ماكن قص نجيلة	ماكن قص نجيلة	t	2026-02-11 17:53:54.304	2026-02-11 17:53:54.304	\N	\N
380	52	ماكن غسيل	ماكن غسيل	t	2026-02-11 17:53:54.305	2026-02-11 17:53:54.305	\N	\N
381	52	مناشير زراعية	مناشير زراعية	t	2026-02-11 17:53:54.306	2026-02-11 17:53:54.306	\N	\N
382	53	امتار يدوي	امتار يدوي	t	2026-02-11 17:53:54.308	2026-02-11 17:53:54.308	\N	\N
383	53	امتار ليزر	امتار ليزر	t	2026-02-11 17:53:54.309	2026-02-11 17:53:54.309	\N	\N
384	53	ميزان مياه	ميزان مياه	t	2026-02-11 17:53:54.311	2026-02-11 17:53:54.311	\N	\N
385	53	ميزان ليزر	ميزان ليزر	t	2026-02-11 17:53:54.312	2026-02-11 17:53:54.312	\N	\N
386	53	زاوية علام	زاوية علام	t	2026-02-11 17:53:54.313	2026-02-11 17:53:54.313	\N	\N
387	54	دباسات	دباسات	t	2026-02-11 17:53:54.315	2026-02-11 17:53:54.315	\N	\N
388	54	دريل	دريل	t	2026-02-11 17:53:54.316	2026-02-11 17:53:54.316	\N	\N
389	55	شنيور	شنيور	t	2026-02-11 17:53:54.352	2026-02-11 17:53:54.352	\N	\N
390	55	وهيلتي	وهيلتي	t	2026-02-11 17:53:54.369	2026-02-11 17:53:54.369	\N	\N
391	55	بلاور	بلاور	t	2026-02-11 17:53:54.392	2026-02-11 17:53:54.392	\N	\N
392	55	تسخين هوت جن	تسخين هوت جن	t	2026-02-11 17:53:54.396	2026-02-11 17:53:54.396	\N	\N
393	55	دهانات	دهانات	t	2026-02-11 17:53:54.405	2026-02-11 17:53:54.405	\N	\N
394	55	صاروخ	صاروخ	t	2026-02-11 17:53:54.406	2026-02-11 17:53:54.406	\N	\N
395	55	اركت	اركت	t	2026-02-11 17:53:54.429	2026-02-11 17:53:54.429	\N	\N
396	55	راوتر	راوتر	t	2026-02-11 17:53:54.44	2026-02-11 17:53:54.44	\N	\N
397	55	صنية	صنية	t	2026-02-11 17:53:54.444	2026-02-11 17:53:54.444	\N	\N
398	55	ديسك	ديسك	t	2026-02-11 17:53:54.451	2026-02-11 17:53:54.451	\N	\N
399	55	فارة	فارة	t	2026-02-11 17:53:54.456	2026-02-11 17:53:54.456	\N	\N
400	55	صنفرة	صنفرة	t	2026-02-11 17:53:54.46	2026-02-11 17:53:54.46	\N	\N
401	55	ماكن جلخ	ماكن جلخ	t	2026-02-11 17:53:54.471	2026-02-11 17:53:54.471	\N	\N
402	55	ماكن لحام  قصدير	ماكن لحام  قصدير	t	2026-02-11 17:53:54.472	2026-02-11 17:53:54.472	\N	\N
403	55	ماكن لحام  بولي	ماكن لحام  بولي	t	2026-02-11 17:53:54.474	2026-02-11 17:53:54.474	\N	\N
404	55	ماكن لحام حديد	ماكن لحام حديد	t	2026-02-11 17:53:54.476	2026-02-11 17:53:54.476	\N	\N
405	56	مفكات	مفكات	t	2026-02-11 17:53:54.478	2026-02-11 17:53:54.478	\N	\N
406	56	ماكن سيراميك	ماكن سيراميك	t	2026-02-11 17:53:54.511	2026-02-11 17:53:54.511	\N	\N
407	56	لقم ويد سيستم	لقم ويد سيستم	t	2026-02-11 17:53:54.512	2026-02-11 17:53:54.512	\N	\N
408	56	بنس كماشة فرنساوي انجليزي	بنس كماشة فرنساوي انجليزي	t	2026-02-11 17:53:54.514	2026-02-11 17:53:54.514	\N	\N
409	56	اطقم عده	اطقم عده	t	2026-02-11 17:53:54.549	2026-02-11 17:53:54.549	\N	\N
410	56	شاكوش ومطرقة	شاكوش ومطرقة	t	2026-02-11 17:53:54.552	2026-02-11 17:53:54.552	\N	\N
411	56	اطقم الن وبيبه	اطقم الن وبيبه	t	2026-02-11 17:53:54.583	2026-02-11 17:53:54.583	\N	\N
412	56	شنط عده	شنط عده	t	2026-02-11 17:53:54.586	2026-02-11 17:53:54.586	\N	\N
413	56	قمطة وزرجينة ومنجلة	قمطة وزرجينة ومنجلة	t	2026-02-11 17:53:54.587	2026-02-11 17:53:54.587	\N	\N
414	56	اجنة ومسمار يدوي	اجنة ومسمار يدوي	t	2026-02-11 17:53:54.588	2026-02-11 17:53:54.588	\N	\N
415	56	مسدس سليكون	مسدس سليكون	t	2026-02-11 17:53:54.589	2026-02-11 17:53:54.589	\N	\N
416	56	مسدس شمع	مسدس شمع	t	2026-02-11 17:53:54.59	2026-02-11 17:53:54.59	\N	\N
417	56	منشار خشابي وحدادي	منشار خشابي وحدادي	t	2026-02-11 17:53:54.595	2026-02-11 17:53:54.595	\N	\N
418	56	قطرات	قطرات	t	2026-02-11 17:53:54.599	2026-02-11 17:53:54.599	\N	\N
419	56	مفاتيح	مفاتيح	t	2026-02-11 17:53:54.605	2026-02-11 17:53:54.605	\N	\N
420	56	بوكليز	بوكليز	t	2026-02-11 17:53:54.612	2026-02-11 17:53:54.612	\N	\N
421	56	جوانتي	جوانتي	t	2026-02-11 17:53:54.613	2026-02-11 17:53:54.613	\N	\N
422	56	نظارت	نظارت	t	2026-02-11 17:53:54.614	2026-02-11 17:53:54.614	\N	\N
423	56	ادوات سيارات	ادوات سيارات	t	2026-02-11 17:53:54.615	2026-02-11 17:53:54.615	\N	\N
424	56	ازميل	ازميل	t	2026-02-11 17:53:54.626	2026-02-11 17:53:54.626	\N	\N
425	56	مقصات	مقصات	t	2026-02-11 17:53:54.628	2026-02-11 17:53:54.628	\N	\N
426	56	دباسة خشب	دباسة خشب	t	2026-02-11 17:53:54.64	2026-02-11 17:53:54.64	\N	\N
427	56	ادوات دهانات	ادوات دهانات	t	2026-02-11 17:53:54.641	2026-02-11 17:53:54.641	\N	\N
428	57	بنط	بنط	t	2026-02-11 17:53:54.643	2026-02-11 17:53:54.643	\N	\N
429	57	قطع غيار	قطع غيار	t	2026-02-11 17:53:54.644	2026-02-11 17:53:54.644	\N	\N
430	57	صنية والماظة	صنية والماظة	t	2026-02-11 17:53:54.645	2026-02-11 17:53:54.645	\N	\N
431	57	سلاح اركت	سلاح اركت	t	2026-02-11 17:53:54.661	2026-02-11 17:53:54.661	\N	\N
432	57	احجار	احجار	t	2026-02-11 17:53:54.662	2026-02-11 17:53:54.662	\N	\N
433	57	صنفرة وادوات ماكن لحام	صنفرة وادوات ماكن لحام	t	2026-02-11 17:53:54.665	2026-02-11 17:53:54.665	\N	\N
434	57	فرش	فرش	t	2026-02-11 17:53:54.667	2026-02-11 17:53:54.667	\N	\N
435	58	اطقم كومبو	اطقم كومبو	t	2026-02-11 17:53:54.672	2026-02-11 17:53:54.672	\N	\N
436	58	شنيور وهيلتي ودريل	شنيور وهيلتي ودريل	t	2026-02-11 17:53:54.673	2026-02-11 17:53:54.673	\N	\N
437	58	دهانات	دهانات	t	2026-02-11 17:53:54.693	2026-02-11 17:53:54.693	\N	\N
438	58	بلاور وتسخين	بلاور وتسخين	t	2026-02-11 17:53:54.694	2026-02-11 17:53:54.694	\N	\N
439	58	كشافات	كشافات	t	2026-02-11 17:53:54.695	2026-02-11 17:53:54.695	\N	\N
440	58	صاروخ	صاروخ	t	2026-02-11 17:53:54.696	2026-02-11 17:53:54.696	\N	\N
441	58	صنية	صنية	t	2026-02-11 17:53:54.7	2026-02-11 17:53:54.7	\N	\N
442	59	رشاشات	رشاشات	t	2026-02-11 17:53:54.702	2026-02-11 17:53:54.702	\N	\N
443	59	خراطيم	خراطيم	t	2026-02-11 17:53:54.703	2026-02-11 17:53:54.703	\N	\N
444	59	مقصات زرع	مقصات زرع	t	2026-02-11 17:53:54.718	2026-02-11 17:53:54.718	\N	\N
445	59	ادوات زراعة	ادوات زراعة	t	2026-02-11 17:53:54.72	2026-02-11 17:53:54.72	\N	\N
446	59	ماكن قص نجيلة	ماكن قص نجيلة	t	2026-02-11 17:53:54.729	2026-02-11 17:53:54.729	\N	\N
447	59	ماكن غسيل	ماكن غسيل	t	2026-02-11 17:53:54.73	2026-02-11 17:53:54.73	\N	\N
448	59	مناشير زراعية	مناشير زراعية	t	2026-02-11 17:53:54.74	2026-02-11 17:53:54.74	\N	\N
449	60	امتار يدوي	امتار يدوي	t	2026-02-11 17:53:54.744	2026-02-11 17:53:54.744	\N	\N
450	60	امتار ليزر	امتار ليزر	t	2026-02-11 17:53:54.763	2026-02-11 17:53:54.763	\N	\N
451	60	ميزان مياه	ميزان مياه	t	2026-02-11 17:53:54.764	2026-02-11 17:53:54.764	\N	\N
452	60	ميزان ليزر	ميزان ليزر	t	2026-02-11 17:53:54.769	2026-02-11 17:53:54.769	\N	\N
453	60	زاوية علام	زاوية علام	t	2026-02-11 17:53:54.778	2026-02-11 17:53:54.778	\N	\N
454	61	دباسات	دباسات	t	2026-02-11 17:53:54.786	2026-02-11 17:53:54.786	\N	\N
455	61	دريل	دريل	t	2026-02-11 17:53:54.787	2026-02-11 17:53:54.787	\N	\N
456	61	دهانات	دهانات	t	2026-02-11 17:53:54.788	2026-02-11 17:53:54.788	\N	\N
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages (id, key, name_en, name_ar, category, icon, route, sort_order, active, created_at) FROM stdin;
1	sales	Sales	المبيعات	transactions	ShoppingCart	/sales	1	t	2026-02-11 17:53:37.818
2	returns	Returns	المرتجعات	transactions	RotateCcw	/returns	2	t	2026-02-11 17:53:37.822
3	customer-payments	Customer Payments	حسابات العملاء	transactions	DollarSign	/customer-payments	3	t	2026-02-11 17:53:37.824
4	receive-goods	Receive Goods	استلام بضاعة	transactions	Package	/receive-goods	4	t	2026-02-11 17:53:37.824
5	transfers	Transfers	التحويلات	transactions	Plane	/transfers	5	t	2026-02-11 17:53:37.826
6	products	Products	المنتجات	inventory	Box	/products	6	t	2026-02-11 17:53:37.827
7	categories	Categories	التصنيفات	inventory	Tags	/categories	7	t	2026-02-11 17:53:37.828
8	stock-adjustments	Stock Adjustments	تسوية المخزون	inventory	ClipboardList	/stock-adjustments	8	t	2026-02-11 17:53:37.828
9	price-management	Price Management	إدارة الأسعار	inventory	DollarSign	/price-management	9	t	2026-02-11 17:53:37.83
10	customers	Customers	العملاء	people	Users	/customers	11	t	2026-02-11 17:53:37.831
11	suppliers	Suppliers	الموردين	people	Truck	/suppliers	12	t	2026-02-11 17:53:37.832
12	users	Users	المستخدمين	admin	UserCog	/users	13	t	2026-02-11 17:53:37.832
13	roles	Roles	الأدوار والصلاحيات	admin	Shield	/roles	14	t	2026-02-11 17:53:37.833
14	platform-settings	Platform Settings	إعدادات المنصات	admin	Settings	/platform-settings	15	t	2026-02-11 17:53:37.834
15	reports	Reports	التقارير	admin	BarChart3	/reports	16	t	2026-02-11 17:53:37.835
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, sales_invoice_id, amount, payment_method, payment_date, notes, created_by, created_at) FROM stdin;
1	1	2300.00	CASH	2026-02-11 19:28:54.862	Initial payment	2	2026-02-11 19:28:54.862
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, description, created_at) FROM stdin;
1	products:read	View products	2026-02-11 17:53:37.778
2	products:write	Create/edit products	2026-02-11 17:53:37.783
3	sales:create	Create sales	2026-02-11 17:53:37.784
4	sales:read	View sales	2026-02-11 17:53:37.785
5	stock:read	View stock	2026-02-11 17:53:37.785
6	stock:adjust	Adjust stock levels	2026-02-11 17:53:37.786
7	purchasing:read	View purchases	2026-02-11 17:53:37.787
8	purchasing:write	Create purchases	2026-02-11 17:53:37.788
9	users:manage	Manage users and roles	2026-02-11 17:53:37.788
10	settings:manage	Manage system settings	2026-02-11 17:53:37.789
21	platform:NOON	Access Noon marketplace	2026-02-11 19:27:22.526
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, platform, tax_rate, commission, active, created_at, updated_at, icon, name, shipping_fee) FROM stdin;
1	Noon	15.00	0.00	t	2026-02-11 19:27:22.507	2026-02-11 19:27:22.507	🏪	Noon	0.00
\.


--
-- Data for Name: price_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_history (id, product_id, old_price, new_price, price_type, changed_by, reason, created_at) FROM stdin;
\.


--
-- Data for Name: product_audits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_audits (id, product_id, action, old_data, new_data, user_id, created_at) FROM stdin;
1	489	CREATE	\N	{"id": 489, "code": "PROD000466", "cost": 300, "unit": "PCS", "brand": "", "active": true, "maxQty": 15, "minQty": 3, "nameAr": "", "nameEn": "test1", "barcode": "4243242", "costAvg": 300, "categoryId": 1, "itemTypeId": null, "priceRetail": 500, "priceWholesale": 600}	1	2026-02-11 19:28:27.788
2	489	UPDATE	{"returnInfo": {"qty": 2, "returnNo": "RET-BR001-20260211-0001", "returnType": "STOCK", "salesInvoiceNo": "BR001-20260211-0001"}}	{"stockMovement": {"qtyChange": 2, "movementType": "RETURN"}}	2	2026-02-11 19:29:13.13
3	490	UPDATE	{"returnInfo": {"qty": 1, "returnNo": "RET-BR001-20260211-0002", "returnType": "DEFECTIVE", "salesInvoiceNo": "BR001-20260211-0001", "originalProductId": 489, "originalProductCode": "PROD000466"}}	{"stockMovement": {"qtyChange": 1, "movementType": "RETURN"}, "defectiveProduct": {"id": 490, "code": "DEF000490", "barcode": "4243242_DEF"}}	2	2026-02-11 19:29:28.301
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, code, barcode, name_en, name_ar, category_id, brand, unit, cost, cost_avg, price_retail, price_wholesale, min_qty, max_qty, active, created_at, updated_at, item_type_id, retail_margin, wholesale_margin) FROM stdin;
1	TG1091366	6932584805488		شنيور 13 ملي 900وات	3	TOTAL	PCS	945.00	945.00	945.00	945.00	\N	\N	t	2026-02-11 17:53:52.281	2026-02-11 17:53:52.281	1	\N	\N
2	TB6036	6976057331289		بلاور 650	3	TOTAL	PCS	684.00	684.00	684.00	684.00	\N	\N	t	2026-02-11 17:53:52.302	2026-02-11 17:53:52.302	3	\N	\N
3	TB8036	6923736768782		بلاور 800	3	TOTAL	PCS	1365.00	1365.00	1365.00	1365.00	\N	\N	t	2026-02-11 17:53:52.305	2026-02-11 17:53:52.305	3	\N	\N
4	TB20078	6942210229069		مسدس تسخين 2000 وات	3	TOTAL	PCS	639.00	639.00	639.00	639.00	\N	\N	t	2026-02-11 17:53:52.309	2026-02-11 17:53:52.309	4	\N	\N
5	TB200561	6942210229182		مسدس تسخين 2000 ديجيتال شنطه اكسسوار جديد	3	TOTAL	PCS	1584.00	1584.00	1584.00	1584.00	\N	\N	t	2026-02-11 17:53:52.311	2026-02-11 17:53:52.311	4	\N	\N
6	TG2006	6941639877974		ميني كرفت 200	3	TOTAL	PCS	981.00	981.00	981.00	981.00	\N	\N	t	2026-02-11 17:53:52.328	2026-02-11 17:53:52.328	6	\N	\N
7	TS100756	6923736765118		اركت امامي 750	3	TOTAL	PCS	1690.00	1690.00	1690.00	1690.00	\N	\N	t	2026-02-11 17:53:52.334	2026-02-11 17:53:52.334	7	\N	\N
8	TS42142107	6941639841289		ديسك8 بوصه 1400 وات	3	TOTAL	PCS	2797.00	2797.00	2797.00	2797.00	\N	\N	t	2026-02-11 17:53:52.345	2026-02-11 17:53:52.345	10	\N	\N
9	TBG15015	6925582163513		ماتور جلخ  150	3	TOTAL	PCS	1003.00	1003.00	1003.00	1003.00	\N	\N	t	2026-02-11 17:53:52.359	2026-02-11 17:53:52.359	13	\N	\N
10	TET01608	6932584808564		طويله كاويه لحام 90 وات جديده	3	TOTAL	PCS	195.00	195.00	195.00	195.00	\N	\N	t	2026-02-11 17:53:52.364	2026-02-11 17:53:52.364	14	\N	\N
11	TW213049	6942210226297		ماكينه لحام ديجيتال ميني 130	3	TOTAL	PCS	2340.00	2340.00	2340.00	2340.00	\N	\N	t	2026-02-11 17:53:52.374	2026-02-11 17:53:52.374	16	\N	\N
12	tacsd30136	6925582186390		مفك سيستم سن مفك 13*1	3	TOTAL	PCS	120.00	120.00	120.00	120.00	\N	\N	t	2026-02-11 17:53:52.379	2026-02-11 17:53:52.379	17	\N	\N
13	TACSDS1726	6941639866749		مفك سيستم8*1	3	TOTAL	PCS	79.00	79.00	79.00	79.00	\N	\N	t	2026-02-11 17:53:52.382	2026-02-11 17:53:52.382	17	\N	\N
14	THT250PS0601	6925582199666		طقم مفك 6 قطع روزته	3	TOTAL	PCS	105.00	105.00	105.00	105.00	\N	\N	t	2026-02-11 17:53:52.391	2026-02-11 17:53:52.391	17	\N	\N
15	TACIM16PH263	6925582157130		150*2سن مفك صليبه	3	TOTAL	PCS	31.00	31.00	31.00	31.00	\N	\N	t	2026-02-11 17:53:52.396	2026-02-11 17:53:52.396	17	\N	\N
16	tsdli0442	6976057331029		مفك 4 فولت قلاب	3	TOTAL	PCS	409.00	409.00	409.00	409.00	\N	\N	t	2026-02-11 17:53:52.402	2026-02-11 17:53:52.402	17	\N	\N
17	THTDC251001	6941639815105		طقم مفك 10 قطع	3	TOTAL	PCS	130.00	130.00	130.00	130.00	\N	\N	t	2026-02-11 17:53:52.404	2026-02-11 17:53:52.404	17	\N	\N
18	THT421441	6925582183337		طقم لقم مسدس 44 قطعه	3	TOTAL	PCS	2100.00	2100.00	2100.00	2100.00	\N	\N	t	2026-02-11 17:53:52.413	2026-02-11 17:53:52.413	19	\N	\N
19	THT141462	6942210221179		طقم لقم ربع بوصه 46 ق	3	TOTAL	PCS	695.00	695.00	695.00	695.00	\N	\N	t	2026-02-11 17:53:52.418	2026-02-11 17:53:52.418	19	\N	\N
20	thkisd12102l	6925582156515		طقم لقم تصادميه نص بوصه طويله	3	TOTAL	PCS	667.00	667.00	667.00	667.00	\N	\N	t	2026-02-11 17:53:52.42	2026-02-11 17:53:52.42	19	\N	\N
21	THT32108S	6941639842422		بنسه برشام 10.5	3	TOTAL	PCS	108.00	108.00	108.00	108.00	\N	\N	t	2026-02-11 17:53:52.46	2026-02-11 17:53:52.46	20	\N	\N
22	THKTHP11662	6932584804498		شنطه عده 166	3	TOTAL	PCS	2659.00	2659.00	2659.00	2659.00	\N	\N	t	2026-02-11 17:53:52.469	2026-02-11 17:53:52.469	21	\N	\N
23	THKTHP21476	6941639801566		شنطه 147قطعه	3	TOTAL	PCS	5418.00	5418.00	5418.00	5418.00	\N	\N	t	2026-02-11 17:53:52.472	2026-02-11 17:53:52.472	21	\N	\N
24	THKTHP90097	6976057333405		شنطه عده يدويه 9قطع السوده	3	TOTAL	PCS	625.00	625.00	625.00	625.00	\N	\N	t	2026-02-11 17:53:52.474	2026-02-11 17:53:52.474	21	\N	\N
25	TPBXS102	6932584804634		شنطه عده 19 بلاستيك	3	TOTAL	PCS	260.00	260.00	260.00	260.00	\N	\N	t	2026-02-11 17:53:52.493	2026-02-11 17:53:52.493	24	\N	\N
26	TPBX0141	6941639843597		شنطه 14 قفل بلاستك	3	TOTAL	PCS	169.00	169.00	169.00	169.00	\N	\N	t	2026-02-11 17:53:52.495	2026-02-11 17:53:52.495	24	\N	\N
27	TPBX1151	6941639888888		شنطه عده بلاستيك شفافه 15 بوصه	3	TOTAL	PCS	144.00	144.00	144.00	144.00	\N	\N	t	2026-02-11 17:53:52.498	2026-02-11 17:53:52.498	24	\N	\N
28	TPBX0201	6941639843603		شنطه 20 قفل بلاستك	3	TOTAL	PCS	432.00	432.00	432.00	432.00	\N	\N	t	2026-02-11 17:53:52.504	2026-02-11 17:53:52.504	24	\N	\N
29	THT10702	6925582176384		شنطه عده صاج 5 درج	3	TOTAL	PCS	1600.00	1600.00	1600.00	1600.00	\N	\N	t	2026-02-11 17:53:52.508	2026-02-11 17:53:52.508	24	\N	\N
30	THT6126	6925582198287		منجله عصفوره	3	TOTAL	PCS	397.00	397.00	397.00	397.00	\N	\N	t	2026-02-11 17:53:52.513	2026-02-11 17:53:52.513	25	\N	\N
31	TAC1511141	6925582171617		اجنه هيلتي مدببه	3	TOTAL	PCS	51.00	51.00	51.00	51.00	\N	\N	t	2026-02-11 17:53:52.518	2026-02-11 17:53:52.518	26	\N	\N
32	TAC15121411	6925582171624		اجنه هيلتي	3	TOTAL	PCS	51.00	51.00	51.00	51.00	\N	\N	t	2026-02-11 17:53:52.52	2026-02-11 17:53:52.52	26	\N	\N
33	THT55400	6941639845256		سراق 16بوصه	3	TOTAL	PCS	105.00	105.00	105.00	105.00	\N	\N	t	2026-02-11 17:53:52.537	2026-02-11 17:53:52.537	28	\N	\N
34	THT102RK086	6925582183283		طقم مفتاح بلدي مشرشر سيستم	3	TOTAL	PCS	625.00	625.00	625.00	625.00	\N	\N	t	2026-02-11 17:53:52.55	2026-02-11 17:53:52.55	30	\N	\N
35	tacli2018	6976057333351		كمبروسر سياره بدون بطاريه	3	TOTAL	PCS	787.00	787.00	787.00	787.00	\N	\N	t	2026-02-11 17:53:52.565	2026-02-11 17:53:52.565	34	\N	\N
36	THJS0301	6925582158007		طقم جفالته 3 طن	3	TOTAL	PCS	927.00	927.00	927.00	927.00	\N	\N	t	2026-02-11 17:53:52.568	2026-02-11 17:53:52.568	34	\N	\N
37	TVLI20126	6976057331210		مكنسه سياره بطاريه وشاحن	3	TOTAL	PCS	1483.00	1483.00	1483.00	1483.00	\N	\N	t	2026-02-11 17:53:52.577	2026-02-11 17:53:52.577	34	\N	\N
38	THT41166	6925582170887		ازميل 16 ملي	3	TOTAL	PCS	93.00	93.00	93.00	93.00	\N	\N	t	2026-02-11 17:53:52.584	2026-02-11 17:53:52.584	35	\N	\N
39	tacsd0801	6941639850243		طقم بنط حدادي	3	TOTAL	PCS	70.00	70.00	70.00	70.00	\N	\N	t	2026-02-11 17:53:52.604	2026-02-11 17:53:52.604	39	\N	\N
40	tac100303	6925582164503		طقم بنط حدادي 3 ملي	3	TOTAL	PCS	7.00	7.00	7.00	7.00	\N	\N	t	2026-02-11 17:53:52.607	2026-02-11 17:53:52.607	39	\N	\N
41	tac100403	6925582164527		طقم بنط حدادي4 ملي	3	TOTAL	PCS	9.00	9.00	9.00	9.00	\N	\N	t	2026-02-11 17:53:52.609	2026-02-11 17:53:52.609	39	\N	\N
42	tac100503	6925582164541		طقم بنط حدادي5 ملي	3	TOTAL	PCS	10.00	10.00	10.00	10.00	\N	\N	t	2026-02-11 17:53:52.612	2026-02-11 17:53:52.612	39	\N	\N
43	tac100603	6925582164565		طقم بنط حدادي 6 ملي	3	TOTAL	PCS	12.00	12.00	12.00	12.00	\N	\N	t	2026-02-11 17:53:52.614	2026-02-11 17:53:52.614	39	\N	\N
44	TACIM72PH265	6942210228468		سن مفك صليبه اتنين قطعه	3	TOTAL	PCS	33.00	33.00	33.00	33.00	\N	\N	t	2026-02-11 17:53:52.62	2026-02-11 17:53:52.62	39	\N	\N
45	TACIM16HL133	6925582166491		سن مفك عاده وصليبه 6.5	3	TOTAL	PCS	11.00	11.00	11.00	11.00	\N	\N	t	2026-02-11 17:53:52.622	2026-02-11 17:53:52.622	39	\N	\N
46	TACSDB1901	6941639847694		طقم بنط 19 قطعه	3	TOTAL	PCS	103.00	103.00	103.00	103.00	\N	\N	t	2026-02-11 17:53:52.626	2026-02-11 17:53:52.626	39	\N	\N
47	TACSE0056	6925582194258		طقم ايزي اوت	3	TOTAL	PCS	133.00	133.00	133.00	133.00	\N	\N	t	2026-02-11 17:53:52.63	2026-02-11 17:53:52.63	39	\N	\N
48	TACSR1121	6925582165715		طقم بنط رواتر8ملي	3	TOTAL	PCS	530.00	530.00	530.00	530.00	\N	\N	t	2026-02-11 17:53:52.635	2026-02-11 17:53:52.635	39	\N	\N
49	tacsr2121	6925582180220		طقم بنط رواتر 12 ملي	3	TOTAL	PCS	560.00	560.00	560.00	560.00	\N	\N	t	2026-02-11 17:53:52.637	2026-02-11 17:53:52.637	39	\N	\N
50	TAC273651	6941639838661		ادبتور شنيور	3	TOTAL	PCS	63.00	63.00	63.00	63.00	\N	\N	t	2026-02-11 17:53:52.642	2026-02-11 17:53:52.642	40	\N	\N
51	tac2111253	6925582161342		الماظه 5 بوصه مفتوحه	3	TOTAL	PCS	49.00	49.00	49.00	49.00	\N	\N	t	2026-02-11 17:53:52.654	2026-02-11 17:53:52.654	41	\N	\N
52	TAC2111801	6925582163520		الماظه 7 بوصه رخام خدمه شاقه	3	TOTAL	PCS	105.00	105.00	105.00	105.00	\N	\N	t	2026-02-11 17:53:52.658	2026-02-11 17:53:52.658	41	\N	\N
53	TAC2112301	6925582170740		الماظه 9 بوصه مفتوحه للرخام	3	TOTAL	PCS	160.00	160.00	160.00	160.00	\N	\N	t	2026-02-11 17:53:52.661	2026-02-11 17:53:52.661	41	\N	\N
54	TDLI12206	6932584805327		شنيور 12فولت2بطاريه	3	TOTAL	PCS	972.00	972.00	972.00	972.00	\N	\N	t	2026-02-11 17:53:52.688	2026-02-11 17:53:52.688	47	\N	\N
55	TDLI12456	6932584806065		شنيور 12 فولت 20 نيوتن مع بطاريه تايب سي جديد	3	TOTAL	PCS	549.00	549.00	549.00	549.00	\N	\N	t	2026-02-11 17:53:52.692	2026-02-11 17:53:52.692	47	\N	\N
56	THKTHP11292	6932584804405		كيت 129 قطعه شامله شنيور 12 فولت	3	TOTAL	PCS	2485.00	2485.00	2485.00	2485.00	\N	\N	t	2026-02-11 17:53:52.698	2026-02-11 17:53:52.698	47	\N	\N
57	TIDLI16682	6923736768935		شنيور 16 فولت 60نيوتن	3	TOTAL	PCS	2170.00	2170.00	2170.00	2170.00	\N	\N	t	2026-02-11 17:53:52.701	2026-02-11 17:53:52.701	47	\N	\N
58	TIDLI20558	6923736767051		شنيور 55دقاق 2 بطاريه	3	TOTAL	PCS	2234.00	2234.00	2234.00	2234.00	\N	\N	t	2026-02-11 17:53:52.703	2026-02-11 17:53:52.703	47	\N	\N
59	tidli206681	6923736767969		شنيور 66 دقاق بدون	3	TOTAL	PCS	1194.00	1194.00	1194.00	1194.00	\N	\N	t	2026-02-11 17:53:52.707	2026-02-11 17:53:52.707	47	\N	\N
60	tidli209681	6923736769789		شنيور 96 بدون	3	TOTAL	PCS	1780.00	1780.00	1780.00	1780.00	\N	\N	t	2026-02-11 17:53:52.711	2026-02-11 17:53:52.711	47	\N	\N
61	THKTHP31522	6923736766368		طقم دريل 500نيوتن 152ق	3	TOTAL	PCS	6093.00	6093.00	6093.00	6093.00	\N	\N	t	2026-02-11 17:53:52.714	2026-02-11 17:53:52.714	47	\N	\N
62	TIWLI20501	6942210227829		دريل 500 نيوتن بدون	3	TOTAL	PCS	1910.00	1910.00	1910.00	1910.00	\N	\N	t	2026-02-11 17:53:52.721	2026-02-11 17:53:52.721	47	\N	\N
63	TIWLI2085	6942210229731		دريل 850 نيوتن 2بطاريه وشاحن امبير	3	TOTAL	PCS	5051.00	5051.00	5051.00	5051.00	\N	\N	t	2026-02-11 17:53:52.724	2026-02-11 17:53:52.724	47	\N	\N
64	TRHLI212282	6932584805068		22هيلتي عدل 20 فولت 4 امبير	3	TOTAL	PCS	3627.00	3627.00	3627.00	3627.00	\N	\N	t	2026-02-11 17:53:52.727	2026-02-11 17:53:52.727	47	\N	\N
65	TSDLI0458	6932584803057		مفك 4 فولت	3	TOTAL	PCS	367.00	367.00	367.00	367.00	\N	\N	t	2026-02-11 17:53:52.735	2026-02-11 17:53:52.735	47	\N	\N
66	TABLI20781	6932584808403		بلاور 20 فولت بطاريه وشاحن	3	TOTAL	PCS	1035.00	1035.00	1035.00	1035.00	\N	\N	t	2026-02-11 17:53:52.747	2026-02-11 17:53:52.747	49	\N	\N
67	TWLI2038	6941639855170		كشاف بطاريه 20 فولت بدون	3	TOTAL	PCS	338.00	338.00	338.00	338.00	\N	\N	t	2026-02-11 17:53:52.753	2026-02-11 17:53:52.753	50	\N	\N
68	TRLF4415	6941639843528		3.6Vكشاف ليد	3	TOTAL	PCS	912.00	912.00	912.00	912.00	\N	\N	t	2026-02-11 17:53:52.755	2026-02-11 17:53:52.755	50	\N	\N
69	TAPLI2018	6942210223623		صاروخ تلميع 7 بوصه بدون	3	TOTAL	PCS	2274.00	2274.00	2274.00	2274.00	\N	\N	t	2026-02-11 17:53:52.76	2026-02-11 17:53:52.76	51	\N	\N
70	TAGLI261522	6932584803934		صاروخ 4.5بطاريه وشاحن شنطه	3	TOTAL	PCS	1910.00	1910.00	1910.00	1910.00	\N	\N	t	2026-02-11 17:53:52.766	2026-02-11 17:53:52.766	51	\N	\N
71	TMLI20228	6942210221346		مالتي تول بطاريه وشاحن	3	TOTAL	PCS	1779.00	1779.00	1779.00	1779.00	\N	\N	t	2026-02-11 17:53:52.77	2026-02-11 17:53:52.77	51	\N	\N
72	TRSLI1152	6941639866206		منشار ترددي امامي 20 فولت بدون بطاريه معدن 8مم خشابي	3	TOTAL	PCS	1548.00	1548.00	1548.00	1548.00	\N	\N	t	2026-02-11 17:53:52.773	2026-02-11 17:53:52.773	51	\N	\N
73	TRSLI6506	6976057333481		منشار امامي 20 فولت بدون	3	TOTAL	PCS	1270.00	1270.00	1270.00	1270.00	\N	\N	t	2026-02-11 17:53:52.777	2026-02-11 17:53:52.777	51	\N	\N
74	THPHM0201	6941639866114		وصله خرطوم نص بوصه	3	TOTAL	PCS	23.00	23.00	23.00	23.00	\N	\N	t	2026-02-11 17:53:52.786	2026-02-11 17:53:52.786	53	\N	\N
75	THRB8702	6941639890331		فرشه غسيل	3	TOTAL	PCS	180.00	180.00	180.00	180.00	\N	\N	t	2026-02-11 17:53:52.792	2026-02-11 17:53:52.792	53	\N	\N
76	THSPP30502	6941639880936		رشاش 5 لتر	3	TOTAL	PCS	397.00	397.00	397.00	397.00	\N	\N	t	2026-02-11 17:53:52.796	2026-02-11 17:53:52.796	53	\N	\N
77	TGT612131	6925582169829		ماكينه قص النجيله	3	TOTAL	PCS	2155.00	2155.00	2155.00	2155.00	\N	\N	t	2026-02-11 17:53:52.809	2026-02-11 17:53:52.809	57	\N	\N
78	TGTSG026	6925582189056		مسدس ماكينه غسيل	3	TOTAL	PCS	535.00	535.00	535.00	535.00	\N	\N	t	2026-02-11 17:53:52.812	2026-02-11 17:53:52.812	58	\N	\N
79	TPWLI2036	6923736768416		مغسله 20 فولت 24 بار بدون	3	TOTAL	PCS	1072.00	1072.00	1072.00	1072.00	\N	\N	t	2026-02-11 17:53:52.816	2026-02-11 17:53:52.816	58	\N	\N
80	TPWLI20362	6932584804214		مغسله 20 فولت 24بار بطاريه وشاحن	3	TOTAL	PCS	1705.00	1705.00	1705.00	1705.00	\N	\N	t	2026-02-11 17:53:52.818	2026-02-11 17:53:52.818	58	\N	\N
81	TGT11236	6925582192698		مغسله1500وات	3	TOTAL	PCS	3673.00	3673.00	3673.00	3673.00	\N	\N	t	2026-02-11 17:53:52.82	2026-02-11 17:53:52.82	58	\N	\N
82	TGT113026	6941639833789		مغسله 1200 وات	3	TOTAL	PCS	1921.00	1921.00	1921.00	1921.00	\N	\N	t	2026-02-11 17:53:52.822	2026-02-11 17:53:52.822	58	\N	\N
83	TGT11316	6925582186758		مغسله 1400وات	3	TOTAL	PCS	2260.00	2260.00	2260.00	2260.00	\N	\N	t	2026-02-11 17:53:52.824	2026-02-11 17:53:52.824	58	\N	\N
84	TGT11336	6942210223999		مغسله 1600وات	3	TOTAL	PCS	2600.00	2600.00	2600.00	2600.00	\N	\N	t	2026-02-11 17:53:52.826	2026-02-11 17:53:52.826	58	\N	\N
85	TG5451811	6941639826989		منشار بنزين 18 بوصه	3	TOTAL	PCS	3708.00	3708.00	3708.00	3708.00	\N	\N	t	2026-02-11 17:53:52.83	2026-02-11 17:53:52.83	59	\N	\N
86	TGSLI20581	6941639887195		منشار شجر 20 فولت5بوصه	3	TOTAL	PCS	918.00	918.00	918.00	918.00	\N	\N	t	2026-02-11 17:53:52.833	2026-02-11 17:53:52.833	59	\N	\N
87	thtli20018	6941639823131		منشار تسويه اشجار	3	TOTAL	PCS	1313.00	1313.00	1313.00	1313.00	\N	\N	t	2026-02-11 17:53:52.836	2026-02-11 17:53:52.836	59	\N	\N
88	TAT10401	6925582188462		400مسدس دكو مقلوب	3	TOTAL	PCS	427.00	427.00	427.00	427.00	\N	\N	t	2026-02-11 17:53:52.861	2026-02-11 17:53:52.861	67	\N	\N
89	TAT11005	6925582160284		مسدس رش دكو 1.8	3	TOTAL	PCS	450.00	450.00	450.00	450.00	\N	\N	t	2026-02-11 17:53:52.864	2026-02-11 17:53:52.864	67	\N	\N
90	TAT11001	6925582160376		مسدس دكو 1000CC1.5	3	TOTAL	PCS	307.00	307.00	307.00	307.00	\N	\N	t	2026-02-11 17:53:52.867	2026-02-11 17:53:52.867	67	\N	\N
91	TAT40122	6925582167528		دريل هواء نص بوصه	3	TOTAL	PCS	1053.00	1053.00	1053.00	1053.00	\N	\N	t	2026-02-11 17:53:52.871	2026-02-11 17:53:52.871	67	\N	\N
92	TAT83501	6941639818762		دباسه هواء مسمار	3	TOTAL	PCS	777.00	777.00	777.00	777.00	\N	\N	t	2026-02-11 17:53:52.874	2026-02-11 17:53:52.874	67	\N	\N
93	TWP13706	6925582184440		ماتور مياه نص حصان 370 وات غالي	3	TOTAL	PCS	1201.00	1201.00	1201.00	1201.00	\N	\N	t	2026-02-11 17:53:52.889	2026-02-11 17:53:52.889	71	\N	\N
94	TWP137011	6976057331586		ماتور مياه نص حصان 370 وات	3	TOTAL	PCS	993.00	993.00	993.00	993.00	\N	\N	t	2026-02-11 17:53:52.892	2026-02-11 17:53:52.892	71	\N	\N
95	DW02795 V4	6221257437829		شنيور 1050	4	CROWN	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:52.956	2026-02-11 17:53:52.956	72	\N	\N
96	DW01315	6221257353211		شنيور 10 مم 450 وات ظرف اتوماتيك	4	CROWN	PCS	701.00	701.00	701.00	701.00	\N	\N	t	2026-02-11 17:53:52.959	2026-02-11 17:53:52.959	72	\N	\N
97	DW02635	6223007700030		شنيور 13 مم دقاق 650	4	CROWN	PCS	770.00	770.00	770.00	770.00	\N	\N	t	2026-02-11 17:53:52.962	2026-02-11 17:53:52.962	72	\N	\N
98	DW09430	6221257527612		شنيور فك وربط 380وات 320 نيوتن نص	4	CROWN	PCS	2257.00	2257.00	2257.00	2257.00	\N	\N	t	2026-02-11 17:53:52.964	2026-02-11 17:53:52.964	72	\N	\N
99	DW26GV4	6221257353365		كيت شاكوش 850 وات	4	CROWN	PCS	1902.00	1902.00	1902.00	1902.00	\N	\N	t	2026-02-11 17:53:52.968	2026-02-11 17:53:52.968	73	\N	\N
100	DW64	6221257507935		كيت شاكوش تكسير 1600 زيت	4	CROWN	PCS	5843.00	5843.00	5843.00	5843.00	\N	\N	t	2026-02-11 17:53:52.97	2026-02-11 17:53:52.97	73	\N	\N
101	DW26QCC	6223007700061		كيت شاكوش عدل 800 ي\\ش	4	CROWN	PCS	1858.00	1858.00	1858.00	1858.00	\N	\N	t	2026-02-11 17:53:52.976	2026-02-11 17:53:52.976	73	\N	\N
102	DW11C	6221257507911		كيت شاكوش 1300	4	CROWN	PCS	2878.00	2878.00	2878.00	2878.00	\N	\N	t	2026-02-11 17:53:52.98	2026-02-11 17:53:52.98	73	\N	\N
103	DW36PT	6221257353419		كيت شاكوش 1500 وات معدن	4	CROWN	PCS	2560.00	2560.00	2560.00	2560.00	\N	\N	t	2026-02-11 17:53:52.983	2026-02-11 17:53:52.983	73	\N	\N
104	DW09320A V2	6221257520712		بلاور 450 وات صيني	4	CROWN	PCS	547.00	547.00	547.00	547.00	\N	\N	t	2026-02-11 17:53:52.987	2026-02-11 17:53:52.987	74	\N	\N
105	dw09250	6221257354027		مسدس تسخين 2000	4	CROWN	PCS	615.00	615.00	615.00	615.00	\N	\N	t	2026-02-11 17:53:52.992	2026-02-11 17:53:52.992	75	\N	\N
106	DW09223	6221257520743		مسدس تسخين 1800	4	CROWN	PCS	526.00	526.00	526.00	526.00	\N	\N	t	2026-02-11 17:53:52.994	2026-02-11 17:53:52.994	75	\N	\N
107	DW05625_V2	6221257353655		صاروخ 9"2200وات	4	CROWN	PCS	2570.00	2570.00	2570.00	2570.00	\N	\N	t	2026-02-11 17:53:53	2026-02-11 17:53:53	77	\N	\N
108	DW05215-V4	6221257513967		صاروخ 750 وات 4.5 "	4	CROWN	PCS	865.00	865.00	865.00	865.00	\N	\N	t	2026-02-11 17:53:53.002	2026-02-11 17:53:53.002	77	\N	\N
109	DW05369 V4	6221257456127		صاروخ قطعيه يد طويله 1150وات	4	CROWN	PCS	1227.00	1227.00	1227.00	1227.00	\N	\N	t	2026-02-11 17:53:53.005	2026-02-11 17:53:53.005	77	\N	\N
110	DW05555	6221257353631		صاروخ قطعيه 7" 1500 وات	4	CROWN	PCS	1725.00	1725.00	1725.00	1725.00	\N	\N	t	2026-02-11 17:53:53.009	2026-02-11 17:53:53.009	77	\N	\N
111	DW06352	6221257526684		صاروخ تلميع 7 بوصه 1300 وات	4	CROWN	PCS	1602.00	1602.00	1602.00	1602.00	\N	\N	t	2026-02-11 17:53:53.011	2026-02-11 17:53:53.011	77	\N	\N
112	DW05621	6221257541229		صاروخ قطعيه 2000وات 9بوصه	4	CROWN	PCS	1881.00	1881.00	1881.00	1881.00	\N	\N	t	2026-02-11 17:53:53.013	2026-02-11 17:53:53.013	77	\N	\N
113	DW07455	6221257353785		اركيت 800 وات	4	CROWN	PCS	1274.00	1274.00	1274.00	1274.00	\N	\N	t	2026-02-11 17:53:53.017	2026-02-11 17:53:53.017	78	\N	\N
114	DW07405	6221257353778		اركيت 570 وات	4	CROWN	PCS	1010.00	1010.00	1010.00	1010.00	\N	\N	t	2026-02-11 17:53:53.02	2026-02-11 17:53:53.02	78	\N	\N
115	DW07402	6221257523812		اركيت 400 وات	4	CROWN	PCS	747.00	747.00	747.00	747.00	\N	\N	t	2026-02-11 17:53:53.022	2026-02-11 17:53:53.022	78	\N	\N
116	DW08528	6221257353792		حليه الكتروني جسم معدن 440وات	4	CROWN	PCS	1034.00	1034.00	1034.00	1034.00	\N	\N	t	2026-02-11 17:53:53.025	2026-02-11 17:53:53.025	79	\N	\N
117	DW07220 V2	6221257353723		منشار صنيه 7وربع بوصه 1200 وات	4	CROWN	PCS	1927.00	1927.00	1927.00	1927.00	\N	\N	t	2026-02-11 17:53:53.028	2026-02-11 17:53:53.028	80	\N	\N
118	DW07340	6221257456271		منشار صينيه 2000وات 9 بوصه جسم معدن	4	CROWN	PCS	2460.00	2460.00	2460.00	2460.00	\N	\N	t	2026-02-11 17:53:53.031	2026-02-11 17:53:53.031	80	\N	\N
119	DW07743	6221257353877		ديسك 10 بوصه 2000وات	4	CROWN	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.035	2026-02-11 17:53:53.035	81	\N	\N
120	DW08300	6221257353747		فاره كستير 560 وات 82مم	4	CROWN	PCS	1480.00	1480.00	1480.00	1480.00	\N	\N	t	2026-02-11 17:53:53.04	2026-02-11 17:53:53.04	82	\N	\N
121	DW500065	6221257030716		اسكوتش قاعده صنفره	4	CROWN	PCS	35.00	35.00	35.00	35.00	\N	\N	t	2026-02-11 17:53:53.044	2026-02-11 17:53:53.044	83	\N	\N
122	DW08203	6221257523782		صنفره هزاز 240وات	4	CROWN	PCS	709.00	709.00	709.00	709.00	\N	\N	t	2026-02-11 17:53:53.047	2026-02-11 17:53:53.047	83	\N	\N
123	DW08206	6221257523799		صنفره دائريه300وات	4	CROWN	PCS	895.00	895.00	895.00	895.00	\N	\N	t	2026-02-11 17:53:53.049	2026-02-11 17:53:53.049	83	\N	\N
124	AH148507	6221257375695		طقم مفك صليبه 2*38 +مفك عاده 6*38 عجوز	4	CROWN	PCS	47.00	47.00	47.00	47.00	\N	\N	t	2026-02-11 17:53:53.06	2026-02-11 17:53:53.06	88	\N	\N
125	546201_L150	79011000161		مفك قلاب	4	CROWN	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.062	2026-02-11 17:53:53.062	88	\N	\N
126	AH1272130-140	6221257484977		مفك تيست 2 لون 140 مم غالي	4	CROWN	PCS	15.00	15.00	15.00	15.00	\N	\N	t	2026-02-11 17:53:53.064	2026-02-11 17:53:53.064	88	\N	\N
127	AH1272130-190	6221257487787		مفك تست 2 لون 190 مم غالي	4	CROWN	PCS	19.00	19.00	19.00	19.00	\N	\N	t	2026-02-11 17:53:53.066	2026-02-11 17:53:53.066	88	\N	\N
128	AH0172130-140	6221257484281		مفك تست 140	4	CROWN	PCS	15.00	15.00	15.00	15.00	\N	\N	t	2026-02-11 17:53:53.07	2026-02-11 17:53:53.07	88	\N	\N
129	AH0172130-190	6221257484311		مفك تست 190	4	CROWN	PCS	18.00	18.00	18.00	18.00	\N	\N	t	2026-02-11 17:53:53.073	2026-02-11 17:53:53.073	88	\N	\N
130	AH140274	6223007701761		مفك عاده 2 لون 5*150 مم	4	CROWN	PCS	29.00	29.00	29.00	29.00	\N	\N	t	2026-02-11 17:53:53.076	2026-02-11 17:53:53.076	88	\N	\N
131	AH145271	6223007702980		مفك 2 لون قلاب 150 مم	4	CROWN	PCS	50.00	50.00	50.00	50.00	\N	\N	t	2026-02-11 17:53:53.079	2026-02-11 17:53:53.079	88	\N	\N
132	AH1401540-150	6223007708883		قصافه 6"	4	CROWN	PCS	130.00	130.00	130.00	130.00	\N	\N	t	2026-02-11 17:53:53.091	2026-02-11 17:53:53.091	91	\N	\N
133	AH1301540-150	6221257496451		قصافه 6"يد بلاستيك	4	CROWN	PCS	66.00	66.00	66.00	66.00	\N	\N	t	2026-02-11 17:53:53.094	2026-02-11 17:53:53.094	91	\N	\N
134	AH1301540-180	6221257496468		قصافه 7"بلاستك	4	CROWN	PCS	80.00	80.00	80.00	80.00	\N	\N	t	2026-02-11 17:53:53.096	2026-02-11 17:53:53.096	91	\N	\N
135	AH1403540	6223007708920		بنسه7	4	CROWN	PCS	136.00	136.00	136.00	136.00	\N	\N	t	2026-02-11 17:53:53.098	2026-02-11 17:53:53.098	91	\N	\N
136	AH1403540-200	6223007708937		بنسه 8	4	CROWN	PCS	136.00	136.00	136.00	136.00	\N	\N	t	2026-02-11 17:53:53.1	2026-02-11 17:53:53.1	91	\N	\N
137	AH1039775-10	6223007702669		بنسه كلابه 10"	4	CROWN	PCS	180.00	180.00	180.00	180.00	\N	\N	t	2026-02-11 17:53:53.107	2026-02-11 17:53:53.107	91	\N	\N
138	DW15180-250	6221257378771		مفتاح فرنساوي 10"	4	CROWN	PCS	177.00	177.00	177.00	177.00	\N	\N	t	2026-02-11 17:53:53.109	2026-02-11 17:53:53.109	91	\N	\N
139	DW15180-200	6221257378764		مفتاح فرنساوي 8	4	CROWN	PCS	155.00	155.00	155.00	155.00	\N	\N	t	2026-02-11 17:53:53.111	2026-02-11 17:53:53.111	91	\N	\N
140	AH1112240-18-	6221257482027		بنسه تيل خارجيه بوزعدل 7بوصه	4	CROWN	PCS	76.00	76.00	76.00	76.00	\N	\N	t	2026-02-11 17:53:53.114	2026-02-11 17:53:53.114	91	\N	\N
141	TEST-1770832432948-3NJZND	6221257000023		دقماق	4	CROWN	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.122	2026-02-11 17:53:53.122	93	\N	\N
142	TEST-1770832432948-SDJNWC	6223007702263		مطرقه 1000	4	CROWN	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.125	2026-02-11 17:53:53.125	93	\N	\N
143	AH0205340-150	6223007702249		شاكوش بناريج يد خشب 1500	4	CROWN	PCS	230.00	230.00	230.00	230.00	\N	\N	t	2026-02-11 17:53:53.127	2026-02-11 17:53:53.127	93	\N	\N
144	AH0208340-150	6223007702287		مطرقه صلب مربعه يد خشب 1500	4	CROWN	PCS	210.00	210.00	210.00	210.00	\N	\N	t	2026-02-11 17:53:53.129	2026-02-11 17:53:53.129	93	\N	\N
145	AH0205340-200	6223007702256		شاكوش2000 جرام يد خشب	4	CROWN	PCS	253.00	253.00	253.00	253.00	\N	\N	t	2026-02-11 17:53:53.131	2026-02-11 17:53:53.131	93	\N	\N
146	AH0205340-030	6223007702218		شاكوش بناريج يد خشب 300	4	CROWN	PCS	75.00	75.00	75.00	75.00	\N	\N	t	2026-02-11 17:53:53.133	2026-02-11 17:53:53.133	93	\N	\N
147	AH0208340-200	62230007702287		مطرقه صلب مربعه يد خشب 2000	4	CROWN	PCS	240.00	240.00	240.00	240.00	\N	\N	t	2026-02-11 17:53:53.135	2026-02-11 17:53:53.135	93	\N	\N
148	AH0205340-050	6223007702225		شاكوش بناريج يد خشب 500	4	CROWN	PCS	110.00	110.00	110.00	110.00	\N	\N	t	2026-02-11 17:53:53.137	2026-02-11 17:53:53.137	93	\N	\N
149	AH542004-08	6221257000054		دقماق كاوتش اسود يد فايبر 8 اوقيه	4	CROWN	PCS	70.00	70.00	70.00	70.00	\N	\N	t	2026-02-11 17:53:53.14	2026-02-11 17:53:53.14	93	\N	\N
150	AH542104-16	6221257000085		دقماق كاوتش ابيض يد فايبر 16 اوقيه	4	CROWN	PCS	131.00	131.00	131.00	131.00	\N	\N	t	2026-02-11 17:53:53.143	2026-02-11 17:53:53.143	93	\N	\N
151	DW12060	B0924GTHK2		مسدس شمع 60 وات	4	CROWN	PCS	211.00	211.00	211.00	211.00	\N	\N	t	2026-02-11 17:53:53.153	2026-02-11 17:53:53.153	99	\N	\N
152	AH2211720-300	6221257447316		برواز منشار حدادي 1 لون 12"	4	CROWN	PCS	125.00	125.00	125.00	125.00	\N	\N	t	2026-02-11 17:53:53.156	2026-02-11 17:53:53.156	100	\N	\N
153	UC601	6221257526400		كاتر بلاستيك كاوتش 18مم 70 جرام	4	CROWN	PCS	26.00	26.00	26.00	26.00	\N	\N	t	2026-02-11 17:53:53.16	2026-02-11 17:53:53.16	101	\N	\N
154	TA82008	3800031500		كوريك تمساح 1.5طن 300-128	4	CROWN	PCS	1086.00	1086.00	1086.00	1086.00	\N	\N	t	2026-02-11 17:53:53.171	2026-02-11 17:53:53.171	106	\N	\N
155	T90304D	6221257018509		كوريك باكم صيني 3 طن 350 مم	4	CROWN	PCS	493.00	493.00	493.00	493.00	\N	\N	t	2026-02-11 17:53:53.175	2026-02-11 17:53:53.175	106	\N	\N
156	AH2054370-75	6221257483871		مقص مواسير بولي 75	4	CROWN	PCS	450.00	450.00	450.00	450.00	\N	\N	t	2026-02-11 17:53:53.181	2026-02-11 17:53:53.181	108	\N	\N
157	AH1422241	6221257375541		مقص صاج عدل 10"	4	CROWN	PCS	123.00	123.00	123.00	123.00	\N	\N	t	2026-02-11 17:53:53.183	2026-02-11 17:53:53.183	108	\N	\N
158	DW34112-300S	6221257435290		مقص صاج عدل بوزطويل 12"	4	CROWN	PCS	148.00	148.00	148.00	148.00	\N	\N	t	2026-02-11 17:53:53.185	2026-02-11 17:53:53.185	108	\N	\N
159	DW6010312	9605760103124		صينيه فيديا خشب 60 سن	4	CROWN	PCS	357.00	357.00	357.00	357.00	\N	\N	t	2026-02-11 17:53:53.197	2026-02-11 17:53:53.197	113	\N	\N
160	DW6010211	9605760102110		صينيه فيديا خشب 7" 40 سن	4	CROWN	PCS	169.00	169.00	169.00	169.00	\N	\N	t	2026-02-11 17:53:53.199	2026-02-11 17:53:53.199	113	\N	\N
161	DW6010515	6221257031089		صينيه فيديا خشب 96سن	4	CROWN	PCS	775.00	775.00	775.00	775.00	\N	\N	t	2026-02-11 17:53:53.204	2026-02-11 17:53:53.204	113	\N	\N
162	DW6010513	9605760105135		صينيه فيديا خشب 72	4	CROWN	PCS	703.00	703.00	703.00	703.00	\N	\N	t	2026-02-11 17:53:53.206	2026-02-11 17:53:53.206	113	\N	\N
163	DW788057	6221257466782		فرشه سلك تنظيف لحام يد بلاستك	4	CROWN	PCS	21.00	21.00	21.00	21.00	\N	\N	t	2026-02-11 17:53:53.214	2026-02-11 17:53:53.214	117	\N	\N
164	dw15105	6221257354089		شنيور 2 بطاريه 12v	4	CROWN	PCS	1363.00	1363.00	1363.00	1363.00	\N	\N	t	2026-02-11 17:53:53.22	2026-02-11 17:53:53.22	119	\N	\N
165	DW1611045	6221257527315		شنيور دقاق 10مم ظرف معدن 20 فولت 50 نيوتن واحد بطاريه	4	CROWN	PCS	1290.00	1290.00	1290.00	1290.00	\N	\N	t	2026-02-11 17:53:53.223	2026-02-11 17:53:53.223	119	\N	\N
166	DW1614060	6221257527346		شنيور دقاق 13مم ظرف معدن 20 فولت 60 نيوتن 2بطاريه	4	CROWN	PCS	1938.00	1938.00	1938.00	1938.00	\N	\N	t	2026-02-11 17:53:53.225	2026-02-11 17:53:53.225	119	\N	\N
167	DW0110020	6221257523904		شنيور 12فولت	4	CROWN	PCS	731.00	731.00	731.00	731.00	\N	\N	t	2026-02-11 17:53:53.227	2026-02-11 17:53:53.227	119	\N	\N
168	DW1614045	6221257527728		شنيور دقاق ظرف معدن 20 فولت 50 نيوتن	4	CROWN	PCS	1800.00	1800.00	1800.00	1800.00	\N	\N	t	2026-02-11 17:53:53.229	2026-02-11 17:53:53.229	119	\N	\N
169	DW2504350	6221257527377		درل 350 نيوتن	4	CROWN	PCS	2116.00	2116.00	2116.00	2116.00	\N	\N	t	2026-02-11 17:53:53.231	2026-02-11 17:53:53.231	119	\N	\N
170	DW4550000	6221257527445		صاروخ قطعيه 20 فولت	4	CROWN	PCS	2777.00	2777.00	2777.00	2777.00	\N	\N	t	2026-02-11 17:53:53.237	2026-02-11 17:53:53.237	123	\N	\N
171	TEST-1770832432948-B21B57	6221257483994		خرطوم مياه 25 متر 2/1 بوصه	4	CROWN	PCS	435.00	435.00	435.00	435.00	\N	\N	t	2026-02-11 17:53:53.245	2026-02-11 17:53:53.245	126	\N	\N
172	APTJ12/50	6221257470802		خرطوم مياه 50 متر 2/1 بوصه	4	CROWN	PCS	761.00	761.00	761.00	761.00	\N	\N	t	2026-02-11 17:53:53.247	2026-02-11 17:53:53.247	126	\N	\N
173	APTJL12/100	6221257470819		خرطوم 2/1 بوصه 100 متر	4	CROWN	PCS	1521.00	1521.00	1521.00	1521.00	\N	\N	t	2026-02-11 17:53:53.25	2026-02-11 17:53:53.25	126	\N	\N
174	APTJL25/50	6221257470871		خرطوم 1 " بوصه 50 متر	4	CROWN	PCS	2559.00	2559.00	2559.00	2559.00	\N	\N	t	2026-02-11 17:53:53.252	2026-02-11 17:53:53.252	126	\N	\N
175	3904B	6223007708197		مقص اسوار يد خشب 8"	4	CROWN	PCS	130.00	130.00	130.00	130.00	\N	\N	t	2026-02-11 17:53:53.256	2026-02-11 17:53:53.256	128	\N	\N
176	3922D	6223007708203		مقص اسوار يد معدن 2 لون 8"	4	CROWN	PCS	201.00	201.00	201.00	201.00	\N	\N	t	2026-02-11 17:53:53.258	2026-02-11 17:53:53.258	128	\N	\N
177	3833B	6223007708234		مقص اسوار يد الومنيوم 2 لون 10"	4	CROWN	PCS	318.00	318.00	318.00	318.00	\N	\N	t	2026-02-11 17:53:53.26	2026-02-11 17:53:53.26	128	\N	\N
178	DW20090	6221257484533		ماكينه غسيل تحضير 90 بار 1500 وات	4	CROWN	PCS	2642.00	2642.00	2642.00	2642.00	\N	\N	t	2026-02-11 17:53:53.265	2026-02-11 17:53:53.265	130	\N	\N
179	DW20123	6221257484557		ماكينه غسيل تحضير 120 بار 1800وات	4	CROWN	PCS	3124.00	3124.00	3124.00	3124.00	\N	\N	t	2026-02-11 17:53:53.269	2026-02-11 17:53:53.269	130	\N	\N
180	25h42x	6221257470680		متر 5*25 سلاح ابيض 96	4	CROWN	PCS	64.00	64.00	64.00	64.00	\N	\N	t	2026-02-11 17:53:53.277	2026-02-11 17:53:53.277	132	\N	\N
181	CR-3K57W	6221257442557		متر 3*16سلاح ابيض	4	CROWN	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.279	2026-02-11 17:53:53.279	132	\N	\N
182	CR-5K47E	6223007702560		متر 5*19سلاح ابيض	4	CROWN	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.281	2026-02-11 17:53:53.281	132	\N	\N
183	KR28h42x	6221257470697		متر 8*25 سلاح ابيض 60	4	CROWN	PCS	97.00	97.00	97.00	97.00	\N	\N	t	2026-02-11 17:53:53.283	2026-02-11 17:53:53.283	132	\N	\N
184	CR10K47X	6223007702591		متر 25*10	4	CROWN	PCS	167.00	167.00	167.00	167.00	\N	\N	t	2026-02-11 17:53:53.285	2026-02-11 17:53:53.285	132	\N	\N
185	CR-3K58W	6221257442601		متر قياس 3متر 16مم سلاح ابيض نيلون	4	CROWN	PCS	60.00	60.00	60.00	60.00	\N	\N	t	2026-02-11 17:53:53.287	2026-02-11 17:53:53.287	132	\N	\N
186	808b50	6221257024364		ميزان مياه 2 عين 40 سم	4	CROWN	PCS	170.00	170.00	170.00	170.00	\N	\N	t	2026-02-11 17:53:53.292	2026-02-11 17:53:53.292	134	\N	\N
187	ALM-G5	6221257537918		جهاز ليزر 5 خط	4	CROWN	PCS	1898.00	1898.00	1898.00	1898.00	\N	\N	t	2026-02-11 17:53:53.295	2026-02-11 17:53:53.295	135	\N	\N
188	COPTR-G12	6221257537956		جهاز ليزر 360 اخضر 12 خط	4	CROWN	PCS	3127.00	3127.00	3127.00	3127.00	\N	\N	t	2026-02-11 17:53:53.297	2026-02-11 17:53:53.297	135	\N	\N
189	TRI-1.5	6221257537970		حامل ميزان جهاز ليزر 1.5	4	CROWN	PCS	361.00	361.00	361.00	361.00	\N	\N	t	2026-02-11 17:53:53.298	2026-02-11 17:53:53.298	135	\N	\N
190	DL1C16	6221257025033		زاويه 400 مم	4	CROWN	PCS	57.00	57.00	57.00	57.00	\N	\N	t	2026-02-11 17:53:53.303	2026-02-11 17:53:53.303	136	\N	\N
191	DG-10Y	6221257039405		مسدس هواء بالعداد	4	CROWN	PCS	230.00	230.00	230.00	230.00	\N	\N	t	2026-02-11 17:53:53.311	2026-02-11 17:53:53.311	139	\N	\N
192	W77S	6221257038750		مسدس دكو 1 لتر	4	CROWN	PCS	860.00	860.00	860.00	860.00	\N	\N	t	2026-02-11 17:53:53.315	2026-02-11 17:53:53.315	139	\N	\N
193	4001s	6221257038705		مسدس دكو سوكوتاه 1.80	4	CROWN	PCS	905.00	905.00	905.00	905.00	\N	\N	t	2026-02-11 17:53:53.318	2026-02-11 17:53:53.318	139	\N	\N
194	SGBM9037	6221257001945		كمبرسور 24 لتر	4	CROWN	PCS	3525.00	3525.00	3525.00	3525.00	\N	\N	t	2026-02-11 17:53:53.321	2026-02-11 17:53:53.321	139	\N	\N
195	ID6808	6925582153064		شنيور 680 وات	5	INGCO	PCS	720.00	720.00	720.00	720.00	\N	\N	t	2026-02-11 17:53:53.37	2026-02-11 17:53:53.37	140	\N	\N
196	ID8108	6941640136190		شنيور 13 مللي 810 وات	5	INGCO	PCS	998.00	998.00	998.00	998.00	\N	\N	t	2026-02-11 17:53:53.373	2026-02-11 17:53:53.373	140	\N	\N
197	ID7118	6942141809064		شنيور دقاق 710 وات	5	INGCO	PCS	803.00	803.00	803.00	803.00	\N	\N	t	2026-02-11 17:53:53.375	2026-02-11 17:53:53.375	140	\N	\N
198	ED55038	6942141814488		شنيور 10ملي 550وات	5	INGCO	PCS	680.00	680.00	680.00	680.00	\N	\N	t	2026-02-11 17:53:53.377	2026-02-11 17:53:53.377	140	\N	\N
199	RGH9028	6925582142273		هيلتي 800 وات	5	INGCO	PCS	1763.00	1763.00	1763.00	1763.00	\N	\N	t	2026-02-11 17:53:53.381	2026-02-11 17:53:53.381	141	\N	\N
200	RH150038	6941640153340		هيلتي تكسير 1500	5	INGCO	PCS	2626.00	2626.00	2626.00	2626.00	\N	\N	t	2026-02-11 17:53:53.384	2026-02-11 17:53:53.384	141	\N	\N
201	AB8038	6942141807312		بلاور 800سرعات	5	INGCO	PCS	1420.00	1420.00	1420.00	1420.00	\N	\N	t	2026-02-11 17:53:53.39	2026-02-11 17:53:53.39	142	\N	\N
202	HG200078	6976051788911		مسدس تسخين 2000وات	5	INGCO	PCS	630.00	630.00	630.00	630.00	\N	\N	t	2026-02-11 17:53:53.395	2026-02-11 17:53:53.395	143	\N	\N
203	gg148	6925582126501		مسدس شمع 100 وات	5	INGCO	PCS	186.00	186.00	186.00	186.00	\N	\N	t	2026-02-11 17:53:53.398	2026-02-11 17:53:53.398	143	\N	\N
204	SPG5008	6925582126228		مسدس رش كهرباء550وات	5	INGCO	PCS	1039.00	1039.00	1039.00	1039.00	\N	\N	t	2026-02-11 17:53:53.402	2026-02-11 17:53:53.402	144	\N	\N
205	SPG4506	6942141815249		مسدس رش كهرباء 530وات تانك 1000مل	5	INGCO	PCS	845.00	845.00	845.00	845.00	\N	\N	t	2026-02-11 17:53:53.405	2026-02-11 17:53:53.405	144	\N	\N
206	AC900285	6941640105882		صاروخ 5 بوصه سرعات	5	INGCO	PCS	1117.00	1117.00	1117.00	1117.00	\N	\N	t	2026-02-11 17:53:53.409	2026-02-11 17:53:53.409	145	\N	\N
207	mf3008	6925582127027		صاروخ متعدد ترددي 300 وات	5	INGCO	PCS	1139.00	1139.00	1139.00	1139.00	\N	\N	t	2026-02-11 17:53:53.412	2026-02-11 17:53:53.412	145	\N	\N
208	MG13328	6941640162885		ميني كرافت 130 وات 109ق	5	INGCO	PCS	825.00	825.00	825.00	825.00	\N	\N	t	2026-02-11 17:53:53.415	2026-02-11 17:53:53.415	145	\N	\N
209	JS6508	6925582126167		اركت 650 وات	5	INGCO	PCS	1384.00	1384.00	1384.00	1384.00	\N	\N	t	2026-02-11 17:53:53.421	2026-02-11 17:53:53.421	146	\N	\N
210	PLM6001	6941640156716		راوتر 600	5	INGCO	PCS	1627.00	1627.00	1627.00	1627.00	\N	\N	t	2026-02-11 17:53:53.425	2026-02-11 17:53:53.425	147	\N	\N
211	PL7508	6941640165411		فاره 8بوصه 750وات	5	INGCO	PCS	1686.00	1686.00	1686.00	1686.00	\N	\N	t	2026-02-11 17:53:53.431	2026-02-11 17:53:53.431	150	\N	\N
212	AKISD1208	6925582122374		طقم مفك سيستم 13 قطعه	5	INGCO	PCS	120.00	120.00	120.00	120.00	\N	\N	t	2026-02-11 17:53:53.44	2026-02-11 17:53:53.44	156	\N	\N
213	HKSD0828	6925582104462		طقم مفك يد كاوتش 8قطع	5	INGCO	PCS	202.00	202.00	202.00	202.00	\N	\N	t	2026-02-11 17:53:53.442	2026-02-11 17:53:53.442	156	\N	\N
214	HKSD0428	6941640124760		طقم مفك 4 قطع يد كاوتش	5	INGCO	PCS	100.00	100.00	100.00	100.00	\N	\N	t	2026-02-11 17:53:53.444	2026-02-11 17:53:53.444	156	\N	\N
215	HKSD0258	6925582134933		طقم مفك يد بلاستيك 2*1	5	INGCO	PCS	55.00	55.00	55.00	55.00	\N	\N	t	2026-02-11 17:53:53.446	2026-02-11 17:53:53.446	156	\N	\N
216	HKSD0248	6925582111910		طقم مفك يد كاوتش 2*1	5	INGCO	PCS	56.00	56.00	56.00	56.00	\N	\N	t	2026-02-11 17:53:53.449	2026-02-11 17:53:53.449	156	\N	\N
217	AKISD0202	6925582144192		مفك عجوزقلاب	5	INGCO	PCS	37.00	37.00	37.00	37.00	\N	\N	t	2026-02-11 17:53:53.451	2026-02-11 17:53:53.451	156	\N	\N
218	CTVLI20018	6942141815560		هزاز وشفاط سيراميك بطاريه وشنطه وسكينه معجون	5	INGCO	PCS	1960.00	1960.00	1960.00	1960.00	\N	\N	t	2026-02-11 17:53:53.454	2026-02-11 17:53:53.454	157	\N	\N
219	HKTS14451	6928073673287		طقم لقم ربع 45ق	5	INGCO	PCS	825.00	825.00	825.00	825.00	\N	\N	t	2026-02-11 17:53:53.458	2026-02-11 17:53:53.458	158	\N	\N
220	HKTS14122	6925582137019		طقم لقم ريع 12 قطعه	5	INGCO	PCS	291.00	291.00	291.00	291.00	\N	\N	t	2026-02-11 17:53:53.46	2026-02-11 17:53:53.46	158	\N	\N
221	HKTS12122	6925582109160		طقم لقم نص بوصه 12 قطعه	5	INGCO	PCS	581.00	581.00	581.00	581.00	\N	\N	t	2026-02-11 17:53:53.463	2026-02-11 17:53:53.463	158	\N	\N
222	HSJP0110	6925582100648		كلابه 10"بوصه	5	INGCO	PCS	134.00	134.00	134.00	134.00	\N	\N	t	2026-02-11 17:53:53.467	2026-02-11 17:53:53.467	159	\N	\N
223	HMPC1468P	6941640157089		اراجه نت 8بوصه	5	INGCO	PCS	195.00	195.00	195.00	195.00	\N	\N	t	2026-02-11 17:53:53.471	2026-02-11 17:53:53.471	159	\N	\N
224	HSPJP02250	6925582103182		بنسه جاز 10بوصه	5	INGCO	PCS	112.00	112.00	112.00	112.00	\N	\N	t	2026-02-11 17:53:53.473	2026-02-11 17:53:53.473	159	\N	\N
225	HCP12200	6941640156341		بنسه عزم 8"	5	INGCO	PCS	96.00	96.00	96.00	96.00	\N	\N	t	2026-02-11 17:53:53.475	2026-02-11 17:53:53.475	159	\N	\N
226	HCCB0210	6925582104301		قصافه كابلات 10بوصه	5	INGCO	PCS	138.00	138.00	138.00	138.00	\N	\N	t	2026-02-11 17:53:53.477	2026-02-11 17:53:53.477	159	\N	\N
227	HRS108	6941640155634		بنسه برشام 10.5	5	INGCO	PCS	118.00	118.00	118.00	118.00	\N	\N	t	2026-02-11 17:53:53.481	2026-02-11 17:53:53.481	159	\N	\N
228	HDCP08168	6925582123197		قصافه سلك 6 بوصه	5	INGCO	PCS	82.00	82.00	82.00	82.00	\N	\N	t	2026-02-11 17:53:53.484	2026-02-11 17:53:53.484	159	\N	\N
229	HCP08208	6925582123180		بنسه 8"	5	INGCO	PCS	116.00	116.00	116.00	116.00	\N	\N	t	2026-02-11 17:53:53.488	2026-02-11 17:53:53.488	159	\N	\N
230	HCP08188	6925582123173		بنسه 7"	5	INGCO	PCS	103.00	103.00	103.00	103.00	\N	\N	t	2026-02-11 17:53:53.49	2026-02-11 17:53:53.49	159	\N	\N
231	hkps08311	6941640124739		طقم بنسه 3 قطع	5	INGCO	PCS	237.00	237.00	237.00	237.00	\N	\N	t	2026-02-11 17:53:53.492	2026-02-11 17:53:53.492	159	\N	\N
232	HKTHP21681	6942141809026		طقم عده يدويه 168قطعه	5	INGCO	PCS	1580.00	1580.00	1580.00	1580.00	\N	\N	t	2026-02-11 17:53:53.495	2026-02-11 17:53:53.495	160	\N	\N
233	HCH81008D	6942141805516		شاكوش خلاعه 220جرام	5	INGCO	PCS	101.00	101.00	101.00	101.00	\N	\N	t	2026-02-11 17:53:53.498	2026-02-11 17:53:53.498	161	\N	\N
234	PBXK0301	6941640156426		طقم شنطه عده	5	INGCO	PCS	828.00	828.00	828.00	828.00	\N	\N	t	2026-02-11 17:53:53.502	2026-02-11 17:53:53.502	163	\N	\N
235	HCG1809	6941640189028		مسدس سيلكون 2/1 هلال 9"	5	INGCO	PCS	66.00	66.00	66.00	66.00	\N	\N	t	2026-02-11 17:53:53.508	2026-02-11 17:53:53.508	166	\N	\N
236	HKNS16618	6925582128154		قطر بكره	5	INGCO	PCS	37.00	37.00	37.00	37.00	\N	\N	t	2026-02-11 17:53:53.512	2026-02-11 17:53:53.512	168	\N	\N
237	HKNS11615	6941640178015		قطر الومنيوم 19ملي	5	INGCO	PCS	56.00	56.00	56.00	56.00	\N	\N	t	2026-02-11 17:53:53.515	2026-02-11 17:53:53.515	168	\N	\N
238	HKNS16001	6941640153944		قطر بلاستك	5	INGCO	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.517	2026-02-11 17:53:53.517	168	\N	\N
239	HKSPA1088-I	6925582116984		طقم مفتاح ناحيه 8 قطع من 19-6	5	INGCO	PCS	288.00	288.00	288.00	288.00	\N	\N	t	2026-02-11 17:53:53.52	2026-02-11 17:53:53.52	169	\N	\N
240	HGPUG02	6941640198655		جوانتي	5	INGCO	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.524	2026-02-11 17:53:53.524	171	\N	\N
241	AAC2508	6925582125672		كمبروسر سياره 2 بستم	5	INGCO	PCS	1308.00	1308.00	1308.00	1308.00	\N	\N	t	2026-02-11 17:53:53.53	2026-02-11 17:53:53.53	173	\N	\N
242	CVLI2026	6976051781820		مكنسه 12فولت	5	INGCO	PCS	1100.00	1100.00	1100.00	1100.00	\N	\N	t	2026-02-11 17:53:53.533	2026-02-11 17:53:53.533	173	\N	\N
243	HPCS05428	6941640165879		مقص بولي صغير	5	INGCO	PCS	165.00	165.00	165.00	165.00	\N	\N	t	2026-02-11 17:53:53.537	2026-02-11 17:53:53.537	175	\N	\N
244	SDBIM21PH233	6925582144482		بنط صليبى وصليبه	5	INGCO	PCS	140.00	140.00	140.00	140.00	\N	\N	t	2026-02-11 17:53:53.545	2026-02-11 17:53:53.545	178	\N	\N
245	FBLI12153	6976051781967		بطاريه 12فولت تايب سي	5	INGCO	PCS	335.00	335.00	335.00	335.00	\N	\N	t	2026-02-11 17:53:53.548	2026-02-11 17:53:53.548	179	\N	\N
246	IUCC01	6925582126204		وصله شاحن تايب سي	5	INGCO	PCS	25.00	25.00	25.00	25.00	\N	\N	t	2026-02-11 17:53:53.553	2026-02-11 17:53:53.553	179	\N	\N
247	DMD0111523	6925582153439		طقم الماظه رخام 4.5قطعتين	5	INGCO	PCS	85.00	85.00	85.00	85.00	\N	\N	t	2026-02-11 17:53:53.556	2026-02-11 17:53:53.556	180	\N	\N
248	DMD011802M	6925582124293		الماظه رخام مفتوحه 7بوصه	5	INGCO	PCS	130.00	130.00	130.00	130.00	\N	\N	t	2026-02-11 17:53:53.558	2026-02-11 17:53:53.558	180	\N	\N
249	HWBSW628C	6925582147131		منشار حوائط	5	INGCO	PCS	95.00	95.00	95.00	95.00	\N	\N	t	2026-02-11 17:53:53.561	2026-02-11 17:53:53.561	180	\N	\N
250	HKTHP11291	36942141817794		طقم شنطه شنيور 12 فولت 129 قطعه	5	INGCO	PCS	1357.00	1357.00	1357.00	1357.00	\N	\N	t	2026-02-11 17:53:53.572	2026-02-11 17:53:53.572	185	\N	\N
251	CSDLI0442	6976051783046		شنيور مفك 4 فولت	5	INGCO	PCS	414.00	414.00	414.00	414.00	\N	\N	t	2026-02-11 17:53:53.575	2026-02-11 17:53:53.575	186	\N	\N
252	cldli20558	6942141809835		شنيور 55نيوتن بطاريه وشاحن 2	5	INGCO	PCS	2325.00	2325.00	2325.00	2325.00	\N	\N	t	2026-02-11 17:53:53.578	2026-02-11 17:53:53.578	186	\N	\N
253	CDLI12206	6942141817465		شنيور 12 فولت 2 بطاريه	5	INGCO	PCS	972.00	972.00	972.00	972.00	\N	\N	t	2026-02-11 17:53:53.58	2026-02-11 17:53:53.58	186	\N	\N
254	CDLI205582	6942141809385		شنيور 55نيوتن بطاريه وشاحن 1	5	INGCO	PCS	1520.00	1520.00	1520.00	1520.00	\N	\N	t	2026-02-11 17:53:53.582	2026-02-11 17:53:53.582	186	\N	\N
255	CKLI20286	6942141824500		طقم شنيور 20 فولت 66نيوتن مع دريل فك وربط	5	INGCO	PCS	3295.00	3295.00	3295.00	3295.00	\N	\N	t	2026-02-11 17:53:53.584	2026-02-11 17:53:53.584	186	\N	\N
256	CIWLI2045	6942141814525		دريل بطاريه نص 405نيوتن 2بطاريه	5	INGCO	PCS	2703.00	2703.00	2703.00	2703.00	\N	\N	t	2026-02-11 17:53:53.586	2026-02-11 17:53:53.586	186	\N	\N
257	CABLI2078	6942141816413		بلاور 20 فولت بطاريه وشاحن	5	INGCO	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.59	2026-02-11 17:53:53.59	188	\N	\N
258	ctvli2010	6976051788638		هزاز سيراميك بدون بطاريه	5	INGCO	PCS	1114.50	1114.50	1114.50	1114.50	\N	\N	t	2026-02-11 17:53:53.592	2026-02-11 17:53:53.592	188	\N	\N
259	HHCS03122	6925582108767		طقم تجميع خرطوم نص بوصه 3 قطع	5	INGCO	PCS	62.00	62.00	62.00	62.00	\N	\N	t	2026-02-11 17:53:53.599	2026-02-11 17:53:53.599	192	\N	\N
260	AWG1001	6925582115215		مسدس غسيل	5	INGCO	PCS	270.00	270.00	270.00	270.00	\N	\N	t	2026-02-11 17:53:53.607	2026-02-11 17:53:53.607	197	\N	\N
261	CPWL120362	6942141813580		مسدس غسيل 20 فولت ا بطاريه وشاحن	5	INGCO	PCS	1775.00	1775.00	1775.00	1775.00	\N	\N	t	2026-02-11 17:53:53.611	2026-02-11 17:53:53.611	197	\N	\N
262	HSMT39525	6941640161376		متر 5*25	5	INGCO	PCS	65.00	65.00	65.00	65.00	\N	\N	t	2026-02-11 17:53:53.616	2026-02-11 17:53:53.616	199	\N	\N
263	HSMT39825	6941640153692		متر فرامل 8*25	5	INGCO	PCS	103.00	103.00	103.00	103.00	\N	\N	t	2026-02-11 17:53:53.618	2026-02-11 17:53:53.618	199	\N	\N
264	HSMT08316	6941640153067		متر كاوتش فرامل 3*16	5	INGCO	PCS	48.00	48.00	48.00	48.00	\N	\N	t	2026-02-11 17:53:53.62	2026-02-11 17:53:53.62	199	\N	\N
265	HSMT39316	6941640158857		متر 3*16بلاستيك	5	INGCO	PCS	31.00	31.00	31.00	31.00	\N	\N	t	2026-02-11 17:53:53.622	2026-02-11 17:53:53.622	199	\N	\N
266	HSMT39519	6941640166531		متر 5 متر 19 مللي بلاستيك	5	INGCO	PCS	56.00	56.00	56.00	56.00	\N	\N	t	2026-02-11 17:53:53.625	2026-02-11 17:53:53.625	199	\N	\N
267	HSG1404	6925582140194		دباسه مسمار 1*3	5	INGCO	PCS	227.00	227.00	227.00	227.00	\N	\N	t	2026-02-11 17:53:53.64	2026-02-11 17:53:53.64	204	\N	\N
268	AKT0053	6941640129802		طقم كيت 5 قطع	5	INGCO	PCS	860.00	860.00	860.00	860.00	\N	\N	t	2026-02-11 17:53:53.645	2026-02-11 17:53:53.645	206	\N	\N
269	06012281K1	3165140691864		شنيور 750 وات RE16	6	BOSCH	PCS	3030.00	3030.00	3030.00	3030.00	\N	\N	t	2026-02-11 17:53:53.685	2026-02-11 17:53:53.685	207	\N	\N
270	06011A03KA	4053423240290		شنيور 600 وات	6	BOSCH	PCS	1180.00	1180.00	1180.00	1180.00	\N	\N	t	2026-02-11 17:53:53.688	2026-02-11 17:53:53.688	207	\N	\N
271	06112A6020	3165140992596		هيلتي عدل GBH 220	6	BOSCH	PCS	3965.00	3965.00	3965.00	3965.00	\N	\N	t	2026-02-11 17:53:53.692	2026-02-11 17:53:53.692	208	\N	\N
272	06112A4001	3165140859219		هليتي عدل	6	BOSCH	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.694	2026-02-11 17:53:53.694	208	\N	\N
273	06112A4000	3165140859202		هليتي عدل	6	BOSCH	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.696	2026-02-11 17:53:53.696	208	\N	\N
274	601980490	3165140468299		بلاور 820	6	BOSCH	PCS	2850.00	2850.00	2850.00	2850.00	\N	\N	t	2026-02-11 17:53:53.7	2026-02-11 17:53:53.7	209	\N	\N
275	06019M40K0	4053423245721		بلاور 650	6	BOSCH	PCS	1615.00	1615.00	1615.00	1615.00	\N	\N	t	2026-02-11 17:53:53.703	2026-02-11 17:53:53.703	209	\N	\N
276	060194D020	3165140939287		مسدس تسخين 1800 وات	6	BOSCH	PCS	1450.00	1450.00	1450.00	1450.00	\N	\N	t	2026-02-11 17:53:53.706	2026-02-11 17:53:53.706	210	\N	\N
277	06018C10K0	3165140972772		صاروخ 9"2200وات	6	BOSCH	PCS	4885.00	4885.00	4885.00	4885.00	\N	\N	t	2026-02-11 17:53:53.709	2026-02-11 17:53:53.709	211	\N	\N
278	06013A30K0	4059952506746		صاروخ 4.5 "710 وات	6	BOSCH	PCS	1180.00	1180.00	1180.00	1180.00	\N	\N	t	2026-02-11 17:53:53.712	2026-02-11 17:53:53.712	211	\N	\N
279	06013960K7	3165140899659		صاروخ 5" 900 وات	6	BOSCH	PCS	3950.00	3950.00	3950.00	3950.00	\N	\N	t	2026-02-11 17:53:53.714	2026-02-11 17:53:53.714	211	\N	\N
280	601824800	3165140394475		صاروخ 1400 وات	6	BOSCH	PCS	7380.00	7380.00	7380.00	7380.00	\N	\N	t	2026-02-11 17:53:53.716	2026-02-11 17:53:53.716	211	\N	\N
281	06015A8000	3165140940214		اركت 450	6	BOSCH	PCS	1615.00	1615.00	1615.00	1615.00	\N	\N	t	2026-02-11 17:53:53.72	2026-02-11 17:53:53.72	212	\N	\N
282	06012980K0	3165140784009		صنفره هزاز 190وات Gss 2300	6	BOSCH	PCS	2509.00	2509.00	2509.00	2509.00	\N	\N	t	2026-02-11 17:53:53.728	2026-02-11 17:53:53.728	217	\N	\N
283	2607019327	3165140379502		شنطة بنط	6	BOSCH	PCS	940.00	940.00	940.00	940.00	\N	\N	t	2026-02-11 17:53:53.764	2026-02-11 17:53:53.764	241	\N	\N
284	2608577298	3165140908078		بنط13مم	6	BOSCH	PCS	104.00	104.00	104.00	104.00	\N	\N	t	2026-02-11 17:53:53.769	2026-02-11 17:53:53.769	241	\N	\N
285	2608577238	3165140907477		بنط7مم	6	BOSCH	PCS	30.00	30.00	30.00	30.00	\N	\N	t	2026-02-11 17:53:53.772	2026-02-11 17:53:53.772	241	\N	\N
286	2608577278	3165140907873		بنط11مم	6	BOSCH	PCS	80.00	80.00	80.00	80.00	\N	\N	t	2026-02-11 17:53:53.775	2026-02-11 17:53:53.775	241	\N	\N
287	2608577258	3165140907675		بنط9مم	6	BOSCH	PCS	60.00	60.00	60.00	60.00	\N	\N	t	2026-02-11 17:53:53.777	2026-02-11 17:53:53.777	241	\N	\N
288	2608585876	3165140521116		بنط 3مم	6	BOSCH	PCS	28.00	28.00	28.00	28.00	\N	\N	t	2026-02-11 17:53:53.779	2026-02-11 17:53:53.779	241	\N	\N
289	2608577218	3165140907279		بنط 5مم	6	BOSCH	PCS	21.00	21.00	21.00	21.00	\N	\N	t	2026-02-11 17:53:53.781	2026-02-11 17:53:53.781	241	\N	\N
290	2608585885	3165140521208		بنط 5مم استانلس	6	BOSCH	PCS	53.00	53.00	53.00	53.00	\N	\N	t	2026-02-11 17:53:53.783	2026-02-11 17:53:53.783	241	\N	\N
291	2608577248	3165140907576		بنطه 8 علبه	6	BOSCH	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.786	2026-02-11 17:53:53.786	241	\N	\N
292	2608579434	3165140985567		بنطه هيلتي 12 مم بلس 1	6	BOSCH	PCS	65.00	65.00	65.00	65.00	\N	\N	t	2026-02-11 17:53:53.787	2026-02-11 17:53:53.787	241	\N	\N
293	2608579425	3165140985475		بنطه هيلتي 8 مم بلس 1	6	BOSCH	PCS	53.00	53.00	53.00	53.00	\N	\N	t	2026-02-11 17:53:53.792	2026-02-11 17:53:53.792	241	\N	\N
294	2608577208	3165140907170		بنط 4 ملي	6	BOSCH	PCS	21.00	21.00	21.00	21.00	\N	\N	t	2026-02-11 17:53:53.797	2026-02-11 17:53:53.797	241	\N	\N
295	2608585898	3165140521338		بنطة 10مم	6	BOSCH	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:53.8	2026-02-11 17:53:53.8	241	\N	\N
296	2608615030	3165140857079		الماظه رخام 7"	6	BOSCH	PCS	300.00	300.00	300.00	300.00	\N	\N	t	2026-02-11 17:53:53.807	2026-02-11 17:53:53.807	243	\N	\N
297	2608600221	3165140116428		حجر قطعيه	6	BOSCH	PCS	50.00	50.00	50.00	50.00	\N	\N	t	2026-02-11 17:53:53.812	2026-02-11 17:53:53.812	244	\N	\N
298	2608619383	4059952524764		حجر 4.5بسكوته صيني اخضر	6	BOSCH	PCS	18.00	18.00	18.00	18.00	\N	\N	t	2026-02-11 17:53:53.814	2026-02-11 17:53:53.814	244	\N	\N
299	2608600096	3165140070928		حجر بسكوته 9"سلفاتي فلات	6	BOSCH	PCS	100.00	100.00	100.00	100.00	\N	\N	t	2026-02-11 17:53:53.817	2026-02-11 17:53:53.817	244	\N	\N
300	2608603183	3165140658409		حجر جلخ 7"صيني	6	BOSCH	PCS	86.00	86.00	86.00	86.00	\N	\N	t	2026-02-11 17:53:53.82	2026-02-11 17:53:53.82	244	\N	\N
301	2608603184	3165140658416		حجر جلخ 9"بمباي فلات	6	BOSCH	PCS	128.00	128.00	128.00	128.00	\N	\N	t	2026-02-11 17:53:53.823	2026-02-11 17:53:53.823	244	\N	\N
302	2608619770	4059952631370		حجر بسكوته 9"صيني فلات	6	BOSCH	PCS	58.00	58.00	58.00	58.00	\N	\N	t	2026-02-11 17:53:53.826	2026-02-11 17:53:53.826	244	\N	\N
303	2608600226	3165140116473		حجر قطعيه 9"سلفاني بمباي	6	BOSCH	PCS	92.00	92.00	92.00	92.00	\N	\N	t	2026-02-11 17:53:53.828	2026-02-11 17:53:53.828	244	\N	\N
304	2608601708	3165140933902		صنفره مروحيه4.5"خشانه 60 سم	6	BOSCH	PCS	40.00	40.00	40.00	40.00	\N	\N	t	2026-02-11 17:53:53.834	2026-02-11 17:53:53.834	245	\N	\N
305	06019K91K0	4059952599038		دريل بطاريه 18 فولت GSB 183LI	6	BOSCH	PCS	5930.00	5930.00	5930.00	5930.00	\N	\N	t	2026-02-11 17:53:53.839	2026-02-11 17:53:53.839	247	\N	\N
306	0601072S00	4059952518800		متر ليز 50 Glm 50-22	6	BOSCH	PCS	4715.00	4715.00	4715.00	4715.00	\N	\N	t	2026-02-11 17:53:53.857	2026-02-11 17:53:53.857	258	\N	\N
307	601065320	4053423244212		ميزان ليزر 2	6	BOSCH	PCS	2400.00	2400.00	2400.00	2400.00	\N	\N	t	2026-02-11 17:53:53.863	2026-02-11 17:53:53.863	260	\N	\N
308	0601063CJ0	3165140739429		ميزان ليزر 3	6	BOSCH	PCS	3250.00	3250.00	3250.00	3250.00	\N	\N	t	2026-02-11 17:53:53.865	2026-02-11 17:53:53.865	260	\N	\N
309	0601096B00	3165140807838		حامل	6	BOSCH	PCS	1940.00	1940.00	1940.00	1940.00	\N	\N	t	2026-02-11 17:53:53.867	2026-02-11 17:53:53.867	260	\N	\N
310	JDAB15401	6942210209627		بلاور 400 وات	7	JADEVER	PCS	480.00	480.00	480.00	480.00	\N	\N	t	2026-02-11 17:53:53.913	2026-02-11 17:53:53.913	266	\N	\N
311	JDHG1516	6942210209955		مسدس تسخين 1600وات	7	JADEVER	PCS	390.00	390.00	390.00	390.00	\N	\N	t	2026-02-11 17:53:53.917	2026-02-11 17:53:53.917	267	\N	\N
312	JDLT155001	6942210211705		راوتر 500وات	7	JADEVER	PCS	1050.00	1050.00	1050.00	1050.00	\N	\N	t	2026-02-11 17:53:53.925	2026-02-11 17:53:53.925	271	\N	\N
313	JDL5606	6942210213457		مسدس لحام قصدير 60وات	7	JADEVER	PCS	229.00	229.00	229.00	229.00	\N	\N	t	2026-02-11 17:53:53.935	2026-02-11 17:53:53.935	277	\N	\N
314	JDSS2302	6942210209085		طقم2 ﻣﻔﻚ واﺣﺪ ﻟﻮن يد بلاستك	7	JADEVER	PCS	35.00	35.00	35.00	35.00	\N	\N	t	2026-02-11 17:53:53.944	2026-02-11 17:53:53.944	280	\N	\N
315	JDST2212	6942210210098		طقم لقم 1/2 بوصة باليد 12قطعة	7	JADEVER	PCS	481.00	481.00	481.00	481.00	\N	\N	t	2026-02-11 17:53:53.95	2026-02-11 17:53:53.95	282	\N	\N
316	JDRW1212	6942210210081		يد سيستيم 1/2 بوصه 45 سنه	7	JADEVER	PCS	222.00	222.00	222.00	222.00	\N	\N	t	2026-02-11 17:53:53.953	2026-02-11 17:53:53.953	282	\N	\N
317	JDAW174K	6942210217752		طقم مفتاح فرنساوي 6\\8\\10\\12	7	JADEVER	PCS	432.00	432.00	432.00	432.00	\N	\N	t	2026-02-11 17:53:53.956	2026-02-11 17:53:53.956	283	\N	\N
318	JDPL778	6923736796693		بنسة 8 " متعددة خدمة شاقة	7	JADEVER	PCS	193.00	193.00	193.00	193.00	\N	\N	t	2026-02-11 17:53:53.959	2026-02-11 17:53:53.959	283	\N	\N
319	JDMB2315	6942210202628		ﻣﻄﺮﻗﻪ 1.5 ﻛﻴﻠﻮ ﺑﻨﺎرﻳﺞ ﻳﺪ ﺧﺸﺐ	7	JADEVER	PCS	160.00	160.00	160.00	160.00	\N	\N	t	2026-02-11 17:53:53.964	2026-02-11 17:53:53.964	285	\N	\N
320	JDMB2320	6942210202635		ﻣﻄﺮﻗﻪ 2 ﻛﻴﻠﻮ ﻳﺪ ﺧﺸﺐ	7	JADEVER	PCS	191.00	191.00	191.00	191.00	\N	\N	t	2026-02-11 17:53:53.967	2026-02-11 17:53:53.967	285	\N	\N
321	JDMB1305	6942210202581		شاكوش500 ﺟﺮام ﻳﺪ ﺧﺸﺐ	7	JADEVER	PCS	81.00	81.00	81.00	81.00	\N	\N	t	2026-02-11 17:53:53.969	2026-02-11 17:53:53.969	285	\N	\N
322	JDMB1310	6942210202598		شاكوش 1 ﻛﻴﻠﻮ ﻳﺪ ﺧﺸﺐ	7	JADEVER	PCS	134.00	134.00	134.00	134.00	\N	\N	t	2026-02-11 17:53:53.971	2026-02-11 17:53:53.971	285	\N	\N
323	JDHK1281	6942210212870		النكيه مطواه مسدس 8ق	7	JADEVER	PCS	82.00	82.00	82.00	82.00	\N	\N	t	2026-02-11 17:53:53.974	2026-02-11 17:53:53.974	286	\N	\N
324	JDHK2291	6942210215123		طقم الانكيه طويل 9 قطع	7	JADEVER	PCS	120.00	120.00	120.00	120.00	\N	\N	t	2026-02-11 17:53:53.976	2026-02-11 17:53:53.976	286	\N	\N
325	JDHK3291	6942210210074		طقم الانكيه توركس طويل 9 قطع	7	JADEVER	PCS	120.00	120.00	120.00	120.00	\N	\N	t	2026-02-11 17:53:53.979	2026-02-11 17:53:53.979	286	\N	\N
326	JDTH4205	6942210203854		من 8مم14-ممL طقم بيبه 5 ق حرف	7	JADEVER	PCS	284.00	284.00	284.00	284.00	\N	\N	t	2026-02-11 17:53:53.981	2026-02-11 17:53:53.981	286	\N	\N
327	JDTB1319	6942210216601		شنطة بلاستك 19 بوصة	7	JADEVER	PCS	432.00	432.00	432.00	432.00	\N	\N	t	2026-02-11 17:53:53.984	2026-02-11 17:53:53.984	287	\N	\N
328	JDTB1316	6942210213983		شنطة بلاستك 16 بوصة	7	JADEVER	PCS	254.00	254.00	254.00	254.00	\N	\N	t	2026-02-11 17:53:53.986	2026-02-11 17:53:53.986	287	\N	\N
329	JDTB1313	6942210212924		شنطة بلاستك 13 بوصة	7	JADEVER	PCS	169.00	169.00	169.00	169.00	\N	\N	t	2026-02-11 17:53:53.988	2026-02-11 17:53:53.988	287	\N	\N
330	JDTB2103	6942210217356		طقم شنطة عدة بلاستيك 3 قطع ( 13.16)	7	JADEVER	PCS	698.00	698.00	698.00	698.00	\N	\N	t	2026-02-11 17:53:53.991	2026-02-11 17:53:53.991	287	\N	\N
331	JDHW6G12	6942210211170		منشار جبس بورد 12"	7	JADEVER	PCS	79.00	79.00	79.00	79.00	\N	\N	t	2026-02-11 17:53:53.999	2026-02-11 17:53:53.999	292	\N	\N
332	JDSP1208	6942210203878		طقم مفتاح بلدي مشرشر 8 قطع	7	JADEVER	PCS	256.00	256.00	256.00	256.00	\N	\N	t	2026-02-11 17:53:54.004	2026-02-11 17:53:54.004	294	\N	\N
333	JDH 25021	6923736797645		كوريك تمساح2 طن+شنطة BMCجديد	7	JADEVER	PCS	1198.00	1198.00	1198.00	1198.00	\N	\N	t	2026-02-11 17:53:54.013	2026-02-11 17:53:54.013	298	\N	\N
334	JDLV0801	6923736797034		مكنسه بطارية مكنسة Type C امبير 2000 بطارية	7	JADEVER	PCS	688.00	688.00	688.00	688.00	\N	\N	t	2026-02-11 17:53:54.016	2026-02-11 17:53:54.016	298	\N	\N
335	JDCDS520	6942210214607		شنيور 12 فولت 1 بطاريه بدون	7	JADEVER	PCS	798.00	798.00	798.00	798.00	\N	\N	t	2026-02-11 17:53:54.038	2026-02-11 17:53:54.038	311	\N	\N
336	JDLAP5421	6937541206445		صاروخ براشيلس 4.5 20 فولت	7	JADEVER	PCS	1750.00	1750.00	1750.00	1750.00	\N	\N	t	2026-02-11 17:53:54.045	2026-02-11 17:53:54.045	315	\N	\N
337	JDYP1E20	6923736797089		خرطوم 20 ﻣﺘﺮ 1/2 ﺑﻮﺻﺔ	7	JADEVER	PCS	451.00	451.00	451.00	451.00	\N	\N	t	2026-02-11 17:53:54.051	2026-02-11 17:53:54.051	318	\N	\N
338	JDPR2301	6942431495663		مقص اسوار يد معدن مقاس 22	7	JADEVER	PCS	215.00	215.00	215.00	215.00	\N	\N	t	2026-02-11 17:53:54.054	2026-02-11 17:53:54.054	319	\N	\N
339	JDMT1240	6942210208156		متر قياس 8 متر كاوتش	7	JADEVER	PCS	95.00	95.00	95.00	95.00	\N	\N	t	2026-02-11 17:53:54.065	2026-02-11 17:53:54.065	324	\N	\N
340	JDDL1520	6942431497858		متر ليزر 100	7	JADEVER	PCS	939.00	939.00	939.00	939.00	\N	\N	t	2026-02-11 17:53:54.068	2026-02-11 17:53:54.068	325	\N	\N
341	JDSL2G100	6942210204905		ميزان مياه 2 عين 100سم	7	JADEVER	PCS	135.00	135.00	135.00	135.00	\N	\N	t	2026-02-11 17:53:54.072	2026-02-11 17:53:54.072	326	\N	\N
342	JDSL2G30	6942210201461		ميزان مياه 2 عين 30 سم	7	JADEVER	PCS	52.00	52.00	52.00	52.00	\N	\N	t	2026-02-11 17:53:54.074	2026-02-11 17:53:54.074	326	\N	\N
343	JDL9301	6942210218087		حامل ميزان ليزر 1.10	7	JADEVER	PCS	493.00	493.00	493.00	493.00	\N	\N	t	2026-02-11 17:53:54.077	2026-02-11 17:53:54.077	327	\N	\N
344	JDKE1502	6942431499395		ميزان مطبخ الكتروني	7	JADEVER	PCS	107.00	107.00	107.00	107.00	\N	\N	t	2026-02-11 17:53:54.079	2026-02-11 17:53:54.079	327	\N	\N
345	JDEC1503	6942431492112		ميزان الكتروني 30 كيلو	7	JADEVER	PCS	750.00	750.00	750.00	750.00	\N	\N	t	2026-02-11 17:53:54.081	2026-02-11 17:53:54.081	327	\N	\N
346	JDGA3575	26942210214120		مسدس جاز غسيل	7	JADEVER	PCS	225.00	225.00	225.00	225.00	\N	\N	t	2026-02-11 17:53:54.089	2026-02-11 17:53:54.089	331	\N	\N
347	WSS1408	6941786812842		طقم مفكات 8 قطع	8	WADFFO	PCS	155.00	155.00	155.00	155.00	\N	\N	t	2026-02-11 17:53:54.149	2026-02-11 17:53:54.149	347	\N	\N
348	WSS1302	6941786812729		طقم مفك 2قطع2 لون	8	WADFFO	PCS	47.00	47.00	47.00	47.00	\N	\N	t	2026-02-11 17:53:54.152	2026-02-11 17:53:54.152	347	\N	\N
349	WSS2206	6941786810800		طقم مفك 6 ق يد بلاستيك	8	WADFFO	PCS	66.00	66.00	66.00	66.00	\N	\N	t	2026-02-11 17:53:54.155	2026-02-11 17:53:54.155	347	\N	\N
350	WMS3217	6941786815041		لقم تصادميه نص بوصه	8	WADFFO	PCS	52.00	52.00	52.00	52.00	\N	\N	t	2026-02-11 17:53:54.159	2026-02-11 17:53:54.159	348	\N	\N
351	WSC1210	6941786806599		لقمه رباط 2\\1 ب 10مم	8	WADFFO	PCS	22.00	22.00	22.00	22.00	\N	\N	t	2026-02-11 17:53:54.161	2026-02-11 17:53:54.161	348	\N	\N
352	WSC1211	6941786806629		لقمه رباط 2\\1 ب 11مم	8	WADFFO	PCS	22.00	22.00	22.00	22.00	\N	\N	t	2026-02-11 17:53:54.164	2026-02-11 17:53:54.164	348	\N	\N
353	WSC1213	6941786806681		لقمه رباط 2\\1 ب 13مم	8	WADFFO	PCS	22.00	22.00	22.00	22.00	\N	\N	t	2026-02-11 17:53:54.166	2026-02-11 17:53:54.166	348	\N	\N
354	WSC1215	6941786806742		لقمه رباط 2\\1 ب 15مم	8	WADFFO	PCS	22.00	22.00	22.00	22.00	\N	\N	t	2026-02-11 17:53:54.168	2026-02-11 17:53:54.168	348	\N	\N
355	WSC1219	6941786806865		لقمه رباط 2\\1 ب 19مم	8	WADFFO	PCS	26.00	26.00	26.00	26.00	\N	\N	t	2026-02-11 17:53:54.17	2026-02-11 17:53:54.17	348	\N	\N
356	WSC1221	6941786806926		لقمه رباط 2\\1 ب 21مم	8	WADFFO	PCS	28.00	28.00	28.00	28.00	\N	\N	t	2026-02-11 17:53:54.173	2026-02-11 17:53:54.173	348	\N	\N
357	WSC1227	6941786807046		لقمه رباط 2\\1 ب 27مم	8	WADFFO	PCS	47.00	47.00	47.00	47.00	\N	\N	t	2026-02-11 17:53:54.175	2026-02-11 17:53:54.175	348	\N	\N
358	WSC1230	6941786807077		لقمه رباط 2\\1 ب 30مم	8	WADFFO	PCS	60.00	60.00	60.00	60.00	\N	\N	t	2026-02-11 17:53:54.178	2026-02-11 17:53:54.178	348	\N	\N
359	WSC1232	6941786807107		لقمه رباط 2\\1 ب 32مم	8	WADFFO	PCS	62.00	62.00	62.00	62.00	\N	\N	t	2026-02-11 17:53:54.18	2026-02-11 17:53:54.18	348	\N	\N
360	TEST-1770832434120-85Z4GK	8150980060166		يدكوريك سيسيتم	8	WADFFO	PCS	80.00	80.00	80.00	80.00	\N	\N	t	2026-02-11 17:53:54.182	2026-02-11 17:53:54.182	348	\N	\N
361	WRW5212	6942431454769		مفتاح عزم 1\\2ب 45سن	8	WADFFO	PCS	389.00	389.00	389.00	389.00	\N	\N	t	2026-02-11 17:53:54.184	2026-02-11 17:53:54.184	348	\N	\N
362	WPL5685	6975085804802		قشاره ترامل 8.5	8	WADFFO	PCS	110.00	110.00	110.00	110.00	\N	\N	t	2026-02-11 17:53:54.189	2026-02-11 17:53:54.189	349	\N	\N
363	WPL3C06	6976057337687		قصافه 6"	8	WADFFO	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:54.193	2026-02-11 17:53:54.193	349	\N	\N
364	WPL6C10	6942123015940		بنسه جاز 10	8	WADFFO	PCS	102.00	102.00	102.00	102.00	\N	\N	t	2026-02-11 17:53:54.195	2026-02-11 17:53:54.195	349	\N	\N
365	WPL1C08	6976057337700		بنسه 8	8	WADFFO	PCS	92.00	92.00	92.00	92.00	\N	\N	t	2026-02-11 17:53:54.197	2026-02-11 17:53:54.197	349	\N	\N
366	WKR1G50	6941786816703		حامل زجاج 2 عين _شفاط 50كجم	8	WADFFO	PCS	136.00	136.00	136.00	136.00	\N	\N	t	2026-02-11 17:53:54.199	2026-02-11 17:53:54.199	349	\N	\N
367	WHR1609	695085803317		بنسه برشام 9.5"	8	WADFFO	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:54.202	2026-02-11 17:53:54.202	349	\N	\N
368	WPL6C08	6942123016947		بنسه جاز 8	8	WADFFO	PCS	73.00	73.00	73.00	73.00	\N	\N	t	2026-02-11 17:53:54.203	2026-02-11 17:53:54.203	349	\N	\N
369	whm1305	6975085800859		شاكوش 500 جرام	8	WADFFO	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:54.209	2026-02-11 17:53:54.209	351	\N	\N
370	WCC1303	6975085801641		اجنه مسمار يدوي 250*16*4	8	WADFFO	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:54.217	2026-02-11 17:53:54.217	355	\N	\N
371	WSK2913	6942123019412		كتر بلاستيك خفيف	8	WADFFO	PCS	10.00	10.00	10.00	10.00	\N	\N	t	2026-02-11 17:53:54.224	2026-02-11 17:53:54.224	357	\N	\N
372	WTH5116	6941786814747		مفتاح بوجيهات 16مم	8	WADFFO	PCS	58.00	58.00	58.00	58.00	\N	\N	t	2026-02-11 17:53:54.228	2026-02-11 17:53:54.228	358	\N	\N
373	WTH5121	6941786814778		مفتاح بوجيهات 21مم	8	WADFFO	PCS	60.00	60.00	60.00	60.00	\N	\N	t	2026-02-11 17:53:54.23	2026-02-11 17:53:54.23	358	\N	\N
374	WHD1208	6941786802591		بنطه هلتي 12*160	8	WADFFO	PCS	30.00	30.00	30.00	30.00	\N	\N	t	2026-02-11 17:53:54.243	2026-02-11 17:53:54.243	366	\N	\N
375	WHD1207	6941786802560		بنطه هلتي 10*160	8	WADFFO	PCS	28.00	28.00	28.00	28.00	\N	\N	t	2026-02-11 17:53:54.245	2026-02-11 17:53:54.245	366	\N	\N
376	WHD1206	6941786802539		بنطه هلتي 8*160	8	WADFFO	PCS	24.00	24.00	24.00	24.00	\N	\N	t	2026-02-11 17:53:54.247	2026-02-11 17:53:54.247	366	\N	\N
377	WHD1202	6941786802416		بنطه هلتي 6*110	8	WADFFO	PCS	22.00	22.00	22.00	22.00	\N	\N	t	2026-02-11 17:53:54.249	2026-02-11 17:53:54.249	366	\N	\N
378	WMJ1K12	6941786805493		بنطه فديه 12*150	8	WADFFO	PCS	32.00	32.00	32.00	32.00	\N	\N	t	2026-02-11 17:53:54.252	2026-02-11 17:53:54.252	366	\N	\N
379	WSJ1K04	6941786804250		بنطه سمسمه12 مم	8	WADFFO	PCS	30.00	30.00	30.00	30.00	\N	\N	t	2026-02-11 17:53:54.257	2026-02-11 17:53:54.257	366	\N	\N
380	WWF1K16	6942431486241		بنطه معلقه 16مم	8	WADFFO	PCS	34.00	34.00	34.00	34.00	\N	\N	t	2026-02-11 17:53:54.26	2026-02-11 17:53:54.26	366	\N	\N
381	WWF1K18	6942431483486		بنطه معلقه 18مم	8	WADFFO	PCS	35.00	35.00	35.00	35.00	\N	\N	t	2026-02-11 17:53:54.263	2026-02-11 17:53:54.263	366	\N	\N
382	WWF1K20	6942431485817		بنطه معلقه 20مم	8	WADFFO	PCS	36.00	36.00	36.00	36.00	\N	\N	t	2026-02-11 17:53:54.266	2026-02-11 17:53:54.266	366	\N	\N
383	WWF1K22	6942431480997		بنطه معلقه 22مم	8	WADFFO	PCS	39.00	39.00	39.00	39.00	\N	\N	t	2026-02-11 17:53:54.268	2026-02-11 17:53:54.268	366	\N	\N
384	WYL2302	6941786804366		صنفره مروحيه	8	WADFFO	PCS	22.00	22.00	22.00	22.00	\N	\N	t	2026-02-11 17:53:54.275	2026-02-11 17:53:54.275	370	\N	\N
385	wce2402	6941786809125		فرشة مجدولة	8	WADFFO	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:54.278	2026-02-11 17:53:54.278	371	\N	\N
386	WCDP511	‎ 6976057336147		شنيور بطاريه 20 فولت	8	WADFFO	PCS	1185.00	1185.00	1185.00	1185.00	\N	\N	t	2026-02-11 17:53:54.29	2026-02-11 17:53:54.29	372	\N	\N
387	WCDS510	6976057338981		شنيور 12 فولت	8	WADFFO	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:54.292	2026-02-11 17:53:54.292	372	\N	\N
388	WGL3608	6941786820380		مسدس شمع 150 وات	8	WADFFO	PCS	157.00	157.00	157.00	157.00	\N	\N	t	2026-02-11 17:53:54.296	2026-02-11 17:53:54.296	373	\N	\N
489	PROD000466	4243242	test1		1		PCS	300.00	300.00	500.00	600.00	3	15	t	2026-02-11 19:28:27.764	2026-02-11 19:28:27.764	\N	\N	\N
490	DEF000490	4243242_DEF	test1 (Defective)	test1 (معيب)	2		PCS	300.00	0.00	400.00	450.00	0	\N	t	2026-02-11 19:29:28.287	2026-02-11 19:29:28.287	\N	\N	\N
435	TEST-1770832434345-QU5T81	6221257000023DUPL		دقماق	9	APT	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:54.554	2026-02-11 17:53:54.554	410	\N	\N
436	TEST-1770832434345-8GIYA2	6223007702263DUPL		مطرقه 1000	9	APT	PCS	0.00	0.00	0.00	0.00	\N	\N	t	2026-02-11 17:53:54.556	2026-02-11 17:53:54.556	410	\N	\N
465	TEST-1770832434345-X20SDD	6221257483994DUPL		خرطوم مياه 25 متر 2/1 بوصه	9	APT	PCS	435.00	435.00	435.00	435.00	\N	\N	t	2026-02-11 17:53:54.706	2026-02-11 17:53:54.706	443	\N	\N
\.


--
-- Data for Name: purchase_order_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_lines (id, purchase_order_id, product_id, qty, price) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, po_no, supplier_id, branch_id, status, expected_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: role_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_pages (role_id, page_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	12
1	13
1	14
1	15
4	1
4	10
4	6
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, created_at, updated_at, is_system) FROM stdin;
1	ADMIN	Full system access	2026-02-11 17:53:37.79	2026-02-11 17:53:37.79	t
2	MANAGER	Branch manager	2026-02-11 17:53:37.794	2026-02-11 17:53:37.794	t
3	STOREKEEPER	Inventory management	2026-02-11 17:53:37.797	2026-02-11 17:53:37.797	f
4	CASHIER	POS operations	2026-02-11 17:53:37.798	2026-02-11 17:53:37.798	f
\.


--
-- Data for Name: sales_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_lines (id, sales_invoice_id, product_id, qty, unit_price, line_discount, tax_rate, line_total, pricetype) FROM stdin;
1	1	489	4	500.00	0.00	15.00	2300.00	RETAIL
\.


--
-- Data for Name: sales_return_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_return_lines (id, return_id, product_id, qty_returned, refund_amount, return_type) FROM stdin;
1	1	489	2	1150.00	STOCK
2	2	489	1	575.00	DEFECTIVE
\.


--
-- Data for Name: salesinvoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salesinvoices (id, invoiceno, branchid, customerid, subtotal, total, totaltax, totaldiscount, discountamount, platformcommission, channel, paymentstatus, paymentmethod, notes, createdby, createdat, updatedat, costofgoods, grossprofit, netprofit, profitmargin, totalrefunded, netrevenue, shippingfee, delivered, deliverydate, paidamount, remainingamount) FROM stdin;
1	BR001-20260211-0001	1	\N	2000.00	2300.00	300.00	0.00	0.00	0.00	Noon	PAID	CASH	Noon - نقدي	2	2026-02-11 19:28:54.854	2026-02-11 19:29:28.305	150.00	350.00	275.00	55.00	1725.00	575.00	0.00	t	2026-02-11 19:28:54.852	2300.00	0.00
\.


--
-- Data for Name: salesreturns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salesreturns (id, returnno, salesinvoiceid, branchid, totalrefund, reason, createdby, createdat) FROM stdin;
1	RET-BR001-20260211-0001	1	1	1150.00		2	2026-02-11 19:29:13.089
2	RET-BR001-20260211-0002	1	1	575.00		2	2026-02-11 19:29:28.28
\.


--
-- Data for Name: stock_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_locations (id, branch_id, name, active, created_at, updated_at) FROM stdin;
1	1	Main Warehouse	t	2026-02-11 17:53:37.769	2026-02-11 17:53:37.769
2	1	Showroom	t	2026-02-11 17:53:37.772	2026-02-11 17:53:37.772
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, product_id, stock_location_id, qty_change, movement_type, ref_table, ref_id, notes, created_by, created_at) FROM stdin;
1	1	1	5	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.284
2	2	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.303
3	3	1	9	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.306
4	4	1	16	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.31
5	5	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.312
6	6	1	5	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.33
7	7	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.335
8	8	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.346
9	9	1	3	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.36
10	10	1	49	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.365
11	11	1	4	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.375
12	12	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.38
13	13	1	4	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.382
14	14	1	11	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.393
15	15	1	14	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.398
16	16	1	40	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.403
17	18	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.414
18	19	1	10	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.418
19	20	1	11	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.421
20	21	1	13	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.461
21	23	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.473
22	24	1	7	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.475
23	26	1	3	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.496
24	27	1	6	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.501
25	29	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.508
26	30	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.514
27	31	1	12	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.519
28	32	1	17	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.521
29	33	1	4	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.538
30	34	1	5	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.551
31	35	1	3	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.566
32	36	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.569
33	37	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.578
34	38	1	9	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.585
35	39	1	19	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.605
36	40	1	80	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.608
37	41	1	40	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.61
38	42	1	90	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.613
39	43	1	50	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.615
40	44	1	23	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.621
41	45	1	75	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.623
42	46	1	19	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.627
43	47	1	15	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.631
44	48	1	5	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.636
45	49	1	4	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.638
46	50	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.643
47	51	1	21	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.656
48	52	1	28	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.659
49	53	1	8	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.662
50	54	1	21	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.689
51	55	1	23	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.693
52	56	1	20	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.699
53	57	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.702
54	58	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.704
55	59	1	6	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.708
56	60	1	3	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.712
57	61	1	5	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.716
58	62	1	6	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.723
59	64	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.728
60	65	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.736
61	66	1	18	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.748
62	68	1	4	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.756
63	69	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.762
64	70	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.767
65	71	1	8	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.771
66	72	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.775
67	73	1	9	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.778
68	74	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.787
69	75	1	16	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.793
70	76	1	3	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.797
71	77	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.81
72	78	1	4	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.813
73	80	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.819
74	82	1	3	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.822
75	83	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.825
76	86	1	6	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.834
77	87	1	1	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.837
78	88	1	5	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.862
79	89	1	13	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.865
80	90	1	18	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.868
81	91	1	2	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.872
82	92	1	10	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.875
83	93	1	5	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.89
84	94	1	12	ADJUSTMENT	\N	\N	Initial stock from TOTAL seed	2	2026-02-11 17:53:52.892
85	95	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.957
86	96	1	10	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.96
87	97	1	6	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.963
88	98	1	6	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.965
89	99	1	11	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.969
90	100	1	1	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.972
91	101	1	7	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.977
92	102	1	2	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.981
93	103	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.984
94	104	1	2	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.988
95	105	1	8	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.993
96	106	1	3	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:52.995
97	108	1	6	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.003
98	109	1	12	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.006
99	110	1	3	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.01
100	111	1	18	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.012
101	112	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.014
102	113	1	1	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.018
103	114	1	3	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.02
104	115	1	7	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.023
105	116	1	9	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.026
106	117	1	3	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.029
107	118	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.032
108	119	1	1	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.036
109	120	1	2	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.041
110	121	1	7	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.045
111	122	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.048
112	123	1	5	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.05
113	124	1	8	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.061
114	125	1	1	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.063
115	126	1	45	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.065
116	127	1	67	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.067
117	128	1	16	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.071
118	129	1	9	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.074
119	130	1	20	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.077
120	131	1	13	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.08
121	132	1	5	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.092
122	133	1	5	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.094
123	134	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.097
124	135	1	24	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.099
125	136	1	37	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.101
126	137	1	3	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.108
127	138	1	34	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.11
128	139	1	29	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.112
129	140	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.115
130	141	1	5	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.123
131	142	1	12	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.125
132	143	1	12	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.128
133	144	1	2	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.13
134	145	1	27	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.132
135	146	1	9	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.134
136	147	1	8	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.136
137	148	1	12	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.138
138	149	1	6	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.141
139	150	1	12	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.144
140	152	1	8	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.157
141	153	1	45	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.161
142	154	1	7	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.172
143	155	1	7	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.176
144	156	1	1	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.181
145	157	1	39	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.183
146	158	1	12	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.185
147	159	1	11	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.198
148	160	1	12	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.2
149	161	1	5	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.205
150	162	1	3	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.207
151	163	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.215
152	164	1	7	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.22
153	165	1	16	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.224
154	166	1	20	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.226
155	167	1	20	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.228
156	169	1	10	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.232
157	170	1	1	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.238
158	171	1	6	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.245
159	172	1	7	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.247
160	173	1	9	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.251
161	174	1	2	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.252
162	175	1	3	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.257
163	176	1	9	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.258
164	177	1	12	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.261
165	178	1	8	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.266
166	179	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.271
167	180	1	1	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.277
168	181	1	24	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.28
169	183	1	6	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.284
170	184	1	1	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.286
171	185	1	1	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.288
172	186	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.293
173	189	1	11	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.299
174	190	1	10	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.304
175	191	1	3	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.312
176	192	1	4	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.316
177	193	1	3	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.319
178	194	1	2	ADJUSTMENT	\N	\N	Initial stock from CROWN seed	2	2026-02-11 17:53:53.322
179	195	1	7	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.371
180	196	1	4	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.374
181	197	1	27	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.376
182	198	1	10	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.378
183	199	1	5	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.382
184	200	1	7	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.385
185	201	1	3	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.392
186	202	1	4	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.396
187	203	1	42	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.399
188	204	1	1	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.403
189	205	1	8	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.406
190	206	1	10	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.41
191	207	1	1	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.413
192	208	1	3	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.416
193	209	1	1	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.422
194	210	1	6	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.425
195	211	1	2	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.431
196	212	1	6	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.441
197	213	1	17	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.442
198	214	1	38	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.445
199	215	1	1	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.447
200	216	1	13	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.449
201	217	1	21	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.452
202	218	1	6	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.455
203	219	1	6	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.459
204	220	1	14	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.461
205	221	1	12	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.463
206	222	1	17	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.469
207	223	1	8	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.472
208	224	1	12	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.474
209	225	1	5	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.476
210	226	1	9	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.478
211	227	1	11	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.481
212	228	1	12	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.485
213	229	1	5	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.489
214	230	1	6	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.491
215	232	1	5	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.496
216	233	1	4	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.499
217	234	1	8	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.503
218	235	1	28	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.509
219	236	1	15	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.513
220	237	1	1	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.515
221	238	1	9	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.517
222	239	1	6	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.521
223	240	1	18	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.525
224	241	1	5	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.531
225	242	1	8	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.534
226	243	1	23	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.538
227	244	1	4	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.545
228	245	1	5	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.549
229	246	1	32	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.554
230	247	1	21	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.557
231	248	1	50	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.559
232	249	1	19	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.561
233	250	1	10	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.573
234	251	1	21	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.576
235	252	1	11	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.579
236	253	1	17	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.581
237	255	1	4	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.585
238	258	1	1	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.593
239	259	1	20	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.6
240	260	1	10	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.608
241	262	1	10	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.616
242	263	1	28	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.619
243	264	1	27	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.621
244	265	1	36	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.623
245	266	1	24	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.626
246	267	1	3	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.641
247	268	1	8	ADJUSTMENT	\N	\N	Initial stock from INGCO seed	2	2026-02-11 17:53:53.645
248	269	1	3	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.686
249	270	1	1	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.689
250	271	1	2	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.693
251	272	1	1	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.695
252	273	1	1	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.697
253	274	1	2	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.701
254	275	1	6	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.704
255	276	1	5	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.707
256	277	1	1	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.71
257	278	1	3	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.713
258	279	1	4	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.715
259	280	1	1	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.717
260	282	1	3	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.729
261	283	1	1	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.765
262	284	1	10	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.77
263	285	1	10	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.773
264	286	1	5	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.776
265	287	1	9	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.778
266	289	1	16	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.781
267	290	1	4	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.784
268	292	1	9	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.789
269	293	1	36	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.793
270	294	1	30	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.798
271	295	1	2	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.8
272	296	1	5	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.808
273	297	1	50	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.813
274	298	1	50	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.815
275	299	1	50	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.818
276	300	1	20	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.821
277	301	1	10	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.824
278	302	1	225	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.826
279	303	1	25	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.829
280	304	1	20	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.835
281	305	1	1	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.84
282	306	1	1	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.858
283	307	1	1	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.864
284	308	1	2	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.866
285	309	1	2	ADJUSTMENT	\N	\N	Initial stock from BOSCH seed	2	2026-02-11 17:53:53.869
286	310	1	2	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.914
287	311	1	3	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.917
288	312	1	5	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.926
289	313	1	1	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.936
290	314	1	53	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.945
291	315	1	13	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.951
292	316	1	5	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.954
293	317	1	1	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.957
294	318	1	2	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.96
295	319	1	6	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.965
296	320	1	7	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.967
297	321	1	14	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.97
298	322	1	7	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.972
299	323	1	9	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.975
300	324	1	18	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.977
301	325	1	23	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.98
302	326	1	1	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.982
303	327	1	4	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.985
304	328	1	2	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.987
305	329	1	7	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.989
306	330	1	2	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:53.992
307	331	1	10	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54
308	332	1	3	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.005
309	333	1	1	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.014
310	334	1	7	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.017
311	335	1	2	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.038
312	336	1	4	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.046
313	337	1	6	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.052
314	338	1	3	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.055
315	339	1	20	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.066
316	340	1	3	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.07
317	341	1	17	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.073
318	342	1	18	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.075
319	343	1	5	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.078
320	344	1	7	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.08
321	345	1	1	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.082
322	346	1	9	ADJUSTMENT	\N	\N	Initial stock from JADEVER seed	2	2026-02-11 17:53:54.09
323	347	1	2	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.15
324	348	1	13	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.153
325	349	1	40	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.155
326	350	1	12	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.16
327	351	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.162
328	352	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.165
329	353	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.167
330	354	1	5	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.169
331	355	1	8	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.171
332	356	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.173
333	357	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.176
334	358	1	8	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.179
335	359	1	6	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.181
336	360	1	5	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.183
337	361	1	4	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.185
338	362	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.19
339	363	1	2	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.194
340	364	1	8	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.196
341	365	1	9	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.198
342	366	1	9	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.2
343	368	1	1	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.204
344	369	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.21
345	370	1	2	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.218
346	371	1	40	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.225
347	372	1	3	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.228
348	373	1	4	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.231
349	374	1	24	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.243
350	375	1	24	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.246
351	376	1	24	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.248
352	377	1	24	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.25
353	378	1	50	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.253
354	379	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.258
355	380	1	12	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.261
356	381	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.264
357	382	1	10	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.266
358	383	1	3	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.268
359	384	1	60	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.276
360	386	1	6	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.291
361	387	1	4	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.293
362	388	1	9	ADJUSTMENT	\N	\N	Initial stock from WADFFO seed	2	2026-02-11 17:53:54.297
363	435	1	5	ADJUSTMENT	\N	\N	Initial stock from APT seed	2	2026-02-11 17:53:54.554
364	436	1	12	ADJUSTMENT	\N	\N	Initial stock from APT seed	2	2026-02-11 17:53:54.557
365	465	1	6	ADJUSTMENT	\N	\N	Initial stock from APT seed	2	2026-02-11 17:53:54.707
366	489	1	30	ADJUSTMENT	\N	\N	جرد دوري	2	2026-02-11 19:28:40.467
367	489	1	-4	SALE	sales_invoices	1	\N	2	2026-02-11 19:28:54.868
368	489	1	2	RETURN	sales_returns	1	Return to stock from invoice BR001-20260211-0001	2	2026-02-11 19:29:13.127
369	490	1	1	RETURN	salesreturns	2	Defective return from invoice BR001-20260211-0001 (Original: PROD000466)	2	2026-02-11 19:29:28.299
\.


--
-- Data for Name: subcategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subcategories (id, category_id, name, name_ar, active, created_at, updated_at, default_retail_margin, default_wholesale_margin) FROM stdin;
1	3	كهرباء	كهرباء	t	2026-02-11 17:53:52.26	2026-02-11 17:53:52.26	\N	\N
2	3	يدوي	يدوي	t	2026-02-11 17:53:52.377	2026-02-11 17:53:52.377	\N	\N
3	3	اكسسوارات	اكسسوارات	t	2026-02-11 17:53:52.601	2026-02-11 17:53:52.601	\N	\N
4	3	بطاررية	بطاررية	t	2026-02-11 17:53:52.675	2026-02-11 17:53:52.675	\N	\N
5	3	جاردن	جاردن	t	2026-02-11 17:53:52.78	2026-02-11 17:53:52.78	\N	\N
6	3	وحدات قياس	وحدات قياس	t	2026-02-11 17:53:52.84	2026-02-11 17:53:52.84	\N	\N
7	3	هواء	هواء	t	2026-02-11 17:53:52.856	2026-02-11 17:53:52.856	\N	\N
8	4	كهرباء	كهرباء	t	2026-02-11 17:53:52.954	2026-02-11 17:53:52.954	\N	\N
9	4	يدوي	يدوي	t	2026-02-11 17:53:53.057	2026-02-11 17:53:53.057	\N	\N
10	4	اكسسوارات	اكسسوارات	t	2026-02-11 17:53:53.19	2026-02-11 17:53:53.19	\N	\N
11	4	بطاررية	بطاررية	t	2026-02-11 17:53:53.216	2026-02-11 17:53:53.216	\N	\N
12	4	جاردن	جاردن	t	2026-02-11 17:53:53.24	2026-02-11 17:53:53.24	\N	\N
13	4	وحدات قياس	وحدات قياس	t	2026-02-11 17:53:53.274	2026-02-11 17:53:53.274	\N	\N
14	4	هواء	هواء	t	2026-02-11 17:53:53.306	2026-02-11 17:53:53.306	\N	\N
15	4	موازين	موازين	t	2026-02-11 17:53:53.323	2026-02-11 17:53:53.323	\N	\N
16	4	بطاريات حجر	بطاريات حجر	t	2026-02-11 17:53:53.324	2026-02-11 17:53:53.324	\N	\N
17	4	مكبس هيدروليك	مكبس هيدروليك	t	2026-02-11 17:53:53.325	2026-02-11 17:53:53.325	\N	\N
18	4	مواتير مياه	مواتير مياه	t	2026-02-11 17:53:53.327	2026-02-11 17:53:53.327	\N	\N
19	5	كهرباء	كهرباء	t	2026-02-11 17:53:53.365	2026-02-11 17:53:53.365	\N	\N
20	5	يدوي	يدوي	t	2026-02-11 17:53:53.438	2026-02-11 17:53:53.438	\N	\N
21	5	اكسسوارات	اكسسوارات	t	2026-02-11 17:53:53.542	2026-02-11 17:53:53.542	\N	\N
22	5	بطاررية	بطاررية	t	2026-02-11 17:53:53.567	2026-02-11 17:53:53.567	\N	\N
23	5	جاردن	جاردن	t	2026-02-11 17:53:53.597	2026-02-11 17:53:53.597	\N	\N
24	5	وحدات قياس	وحدات قياس	t	2026-02-11 17:53:53.613	2026-02-11 17:53:53.613	\N	\N
25	5	هواء	هواء	t	2026-02-11 17:53:53.638	2026-02-11 17:53:53.638	\N	\N
26	5	موازين	موازين	t	2026-02-11 17:53:53.647	2026-02-11 17:53:53.647	\N	\N
27	5	بطاريات حجر	بطاريات حجر	t	2026-02-11 17:53:53.647	2026-02-11 17:53:53.647	\N	\N
28	5	مكبس هيدروليك	مكبس هيدروليك	t	2026-02-11 17:53:53.649	2026-02-11 17:53:53.649	\N	\N
29	5	مواتير مياه	مواتير مياه	t	2026-02-11 17:53:53.65	2026-02-11 17:53:53.65	\N	\N
30	6	كهرباء	كهرباء	t	2026-02-11 17:53:53.683	2026-02-11 17:53:53.683	\N	\N
31	6	يدوي	يدوي	t	2026-02-11 17:53:53.735	2026-02-11 17:53:53.735	\N	\N
32	6	اكسسوارات	اكسسوارات	t	2026-02-11 17:53:53.76	2026-02-11 17:53:53.76	\N	\N
33	6	بطاررية	بطاررية	t	2026-02-11 17:53:53.837	2026-02-11 17:53:53.837	\N	\N
34	6	جاردن	جاردن	t	2026-02-11 17:53:53.844	2026-02-11 17:53:53.844	\N	\N
35	6	وحدات قياس	وحدات قياس	t	2026-02-11 17:53:53.854	2026-02-11 17:53:53.854	\N	\N
36	6	هواء	هواء	t	2026-02-11 17:53:53.871	2026-02-11 17:53:53.871	\N	\N
37	7	كهرباء	كهرباء	t	2026-02-11 17:53:53.906	2026-02-11 17:53:53.906	\N	\N
38	7	يدوي	يدوي	t	2026-02-11 17:53:53.941	2026-02-11 17:53:53.941	\N	\N
39	7	اكسسوارات	اكسسوارات	t	2026-02-11 17:53:54.024	2026-02-11 17:53:54.024	\N	\N
40	7	بطاررية	بطاررية	t	2026-02-11 17:53:54.033	2026-02-11 17:53:54.033	\N	\N
41	7	جاردن	جاردن	t	2026-02-11 17:53:54.048	2026-02-11 17:53:54.048	\N	\N
42	7	وحدات قياس	وحدات قياس	t	2026-02-11 17:53:54.063	2026-02-11 17:53:54.063	\N	\N
43	7	هواء	هواء	t	2026-02-11 17:53:54.084	2026-02-11 17:53:54.084	\N	\N
44	7	موازين	موازين	t	2026-02-11 17:53:54.091	2026-02-11 17:53:54.091	\N	\N
45	7	بطاريات حجر	بطاريات حجر	t	2026-02-11 17:53:54.092	2026-02-11 17:53:54.092	\N	\N
46	7	مكبس هيدروليك	مكبس هيدروليك	t	2026-02-11 17:53:54.093	2026-02-11 17:53:54.093	\N	\N
47	7	مواتير مياه	مواتير مياه	t	2026-02-11 17:53:54.094	2026-02-11 17:53:54.094	\N	\N
48	8	كهرباء	كهرباء	t	2026-02-11 17:53:54.126	2026-02-11 17:53:54.126	\N	\N
49	8	يدوي	يدوي	t	2026-02-11 17:53:54.147	2026-02-11 17:53:54.147	\N	\N
50	8	اكسسوارات	اكسسوارات	t	2026-02-11 17:53:54.24	2026-02-11 17:53:54.24	\N	\N
51	8	بطاررية	بطاررية	t	2026-02-11 17:53:54.279	2026-02-11 17:53:54.279	\N	\N
52	8	جاردن	جاردن	t	2026-02-11 17:53:54.3	2026-02-11 17:53:54.3	\N	\N
53	8	وحدات قياس	وحدات قياس	t	2026-02-11 17:53:54.307	2026-02-11 17:53:54.307	\N	\N
54	8	هواء	هواء	t	2026-02-11 17:53:54.314	2026-02-11 17:53:54.314	\N	\N
55	9	كهرباء	كهرباء	t	2026-02-11 17:53:54.351	2026-02-11 17:53:54.351	\N	\N
56	9	يدوي	يدوي	t	2026-02-11 17:53:54.477	2026-02-11 17:53:54.477	\N	\N
57	9	اكسسوارات	اكسسوارات	t	2026-02-11 17:53:54.642	2026-02-11 17:53:54.642	\N	\N
58	9	بطاررية	بطاررية	t	2026-02-11 17:53:54.671	2026-02-11 17:53:54.671	\N	\N
59	9	جاردن	جاردن	t	2026-02-11 17:53:54.701	2026-02-11 17:53:54.701	\N	\N
60	9	وحدات قياس	وحدات قياس	t	2026-02-11 17:53:54.742	2026-02-11 17:53:54.742	\N	\N
61	9	هواء	هواء	t	2026-02-11 17:53:54.785	2026-02-11 17:53:54.785	\N	\N
62	9	موازين	موازين	t	2026-02-11 17:53:54.805	2026-02-11 17:53:54.805	\N	\N
63	9	بطاريات حجر	بطاريات حجر	t	2026-02-11 17:53:54.806	2026-02-11 17:53:54.806	\N	\N
64	9	مكبس هيدروليك	مكبس هيدروليك	t	2026-02-11 17:53:54.807	2026-02-11 17:53:54.807	\N	\N
65	9	مواتير مياه	مواتير مياه	t	2026-02-11 17:53:54.808	2026-02-11 17:53:54.808	\N	\N
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, contact, phone, email, address, payment_terms, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id) FROM stdin;
1	4
2	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, full_name, branch_id, active, created_at, updated_at) FROM stdin;
1	cashier	$2b$10$NrImATh/220vKeVCGwLzPO5yT1/qk1iYqv5z8N4V.lw6Cq/dmX912	Cashier User	1	t	2026-02-11 17:53:37.925	2026-02-11 17:53:37.925
2	admin	$2b$10$VaSPC86EcWplBrMHD0/oGukMq3cLGWGiAT76E7ES2Nrw0A2rQRJ6K	System Administrator	1	t	2026-02-11 17:53:37.997	2026-02-11 17:53:37.997
\.


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 9, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: goods_receipt_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.goods_receipt_lines_id_seq', 1, false);


--
-- Name: goods_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.goods_receipts_id_seq', 1, false);


--
-- Name: item_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_types_id_seq', 456, true);


--
-- Name: pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pages_id_seq', 30, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 21, true);


--
-- Name: platform_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platform_settings_id_seq', 1, true);


--
-- Name: price_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.price_history_id_seq', 1, false);


--
-- Name: product_audits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_audits_id_seq', 3, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 490, true);


--
-- Name: purchase_order_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_order_lines_id_seq', 1, false);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: sales_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_lines_id_seq', 1, true);


--
-- Name: sales_return_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_return_lines_id_seq', 2, true);


--
-- Name: salesinvoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salesinvoices_id_seq', 1, true);


--
-- Name: salesreturns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salesreturns_id_seq', 2, true);


--
-- Name: stock_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_locations_id_seq', 2, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 369, true);


--
-- Name: subcategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subcategories_id_seq', 65, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: goods_receipt_lines goods_receipt_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_lines
    ADD CONSTRAINT goods_receipt_lines_pkey PRIMARY KEY (id);


--
-- Name: goods_receipts goods_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_pkey PRIMARY KEY (id);


--
-- Name: item_types item_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_types
    ADD CONSTRAINT item_types_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- Name: price_history price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_pkey PRIMARY KEY (id);


--
-- Name: product_audits product_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_audits
    ADD CONSTRAINT product_audits_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_lines purchase_order_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_lines
    ADD CONSTRAINT purchase_order_lines_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: role_pages role_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_pages
    ADD CONSTRAINT role_pages_pkey PRIMARY KEY (role_id, page_id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sales_lines sales_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_lines
    ADD CONSTRAINT sales_lines_pkey PRIMARY KEY (id);


--
-- Name: sales_return_lines sales_return_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_return_lines
    ADD CONSTRAINT sales_return_lines_pkey PRIMARY KEY (id);


--
-- Name: salesinvoices salesinvoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesinvoices
    ADD CONSTRAINT salesinvoices_pkey PRIMARY KEY (id);


--
-- Name: salesreturns salesreturns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesreturns
    ADD CONSTRAINT salesreturns_pkey PRIMARY KEY (id);


--
-- Name: stock_locations stock_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_locations
    ADD CONSTRAINT stock_locations_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: subcategories subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: branches_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX branches_code_key ON public.branches USING btree (code);


--
-- Name: customers_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX customers_phone_key ON public.customers USING btree (phone);


--
-- Name: goods_receipts_created_at_branch_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX goods_receipts_created_at_branch_id_idx ON public.goods_receipts USING btree (created_at, branch_id);


--
-- Name: goods_receipts_grn_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX goods_receipts_grn_no_key ON public.goods_receipts USING btree (grn_no);


--
-- Name: item_types_subcategory_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX item_types_subcategory_id_idx ON public.item_types USING btree (subcategory_id);


--
-- Name: pages_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pages_key_key ON public.pages USING btree (key);


--
-- Name: payments_payment_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_payment_date_idx ON public.payments USING btree (payment_date);


--
-- Name: payments_sales_invoice_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payments_sales_invoice_id_idx ON public.payments USING btree (sales_invoice_id);


--
-- Name: permissions_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);


--
-- Name: platform_settings_platform_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX platform_settings_platform_key ON public.platform_settings USING btree (platform);


--
-- Name: price_history_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX price_history_product_id_idx ON public.price_history USING btree (product_id);


--
-- Name: product_audits_product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_audits_product_id_idx ON public.product_audits USING btree (product_id);


--
-- Name: products_barcode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_barcode_idx ON public.products USING btree (barcode);


--
-- Name: products_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_barcode_key ON public.products USING btree (barcode);


--
-- Name: products_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_code_idx ON public.products USING btree (code);


--
-- Name: products_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_code_key ON public.products USING btree (code);


--
-- Name: products_item_type_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_item_type_id_idx ON public.products USING btree (item_type_id);


--
-- Name: purchase_orders_po_no_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX purchase_orders_po_no_key ON public.purchase_orders USING btree (po_no);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: sales_return_lines_return_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sales_return_lines_return_type_idx ON public.sales_return_lines USING btree (return_type);


--
-- Name: salesinvoices_createdat_branchid_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salesinvoices_createdat_branchid_idx ON public.salesinvoices USING btree (createdat, branchid);


--
-- Name: salesinvoices_invoiceno_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX salesinvoices_invoiceno_key ON public.salesinvoices USING btree (invoiceno);


--
-- Name: salesreturns_createdat_branchid_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX salesreturns_createdat_branchid_idx ON public.salesreturns USING btree (createdat, branchid);


--
-- Name: salesreturns_returnno_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX salesreturns_returnno_key ON public.salesreturns USING btree (returnno);


--
-- Name: stock_movements_product_id_stock_location_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_movements_product_id_stock_location_id_idx ON public.stock_movements USING btree (product_id, stock_location_id);


--
-- Name: stock_movements_ref_table_ref_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_movements_ref_table_ref_id_idx ON public.stock_movements USING btree (ref_table, ref_id);


--
-- Name: subcategories_category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX subcategories_category_id_idx ON public.subcategories USING btree (category_id);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: goods_receipt_lines goods_receipt_lines_goods_receipt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_lines
    ADD CONSTRAINT goods_receipt_lines_goods_receipt_id_fkey FOREIGN KEY (goods_receipt_id) REFERENCES public.goods_receipts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: goods_receipt_lines goods_receipt_lines_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_lines
    ADD CONSTRAINT goods_receipt_lines_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: goods_receipts goods_receipts_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: goods_receipts goods_receipts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: goods_receipts goods_receipts_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipts
    ADD CONSTRAINT goods_receipts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: item_types item_types_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_types
    ADD CONSTRAINT item_types_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_sales_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_sales_invoice_id_fkey FOREIGN KEY (sales_invoice_id) REFERENCES public.salesinvoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_history price_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: price_history price_history_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_history
    ADD CONSTRAINT price_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_audits product_audits_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_audits
    ADD CONSTRAINT product_audits_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_audits product_audits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_audits
    ADD CONSTRAINT product_audits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_item_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_item_type_id_fkey FOREIGN KEY (item_type_id) REFERENCES public.item_types(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_order_lines purchase_order_lines_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_lines
    ADD CONSTRAINT purchase_order_lines_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_lines purchase_order_lines_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_lines
    ADD CONSTRAINT purchase_order_lines_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: role_pages role_pages_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_pages
    ADD CONSTRAINT role_pages_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_pages role_pages_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_pages
    ADD CONSTRAINT role_pages_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_lines sales_lines_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_lines
    ADD CONSTRAINT sales_lines_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_lines sales_lines_sales_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_lines
    ADD CONSTRAINT sales_lines_sales_invoice_id_fkey FOREIGN KEY (sales_invoice_id) REFERENCES public.salesinvoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_return_lines sales_return_lines_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_return_lines
    ADD CONSTRAINT sales_return_lines_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_return_lines sales_return_lines_return_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_return_lines
    ADD CONSTRAINT sales_return_lines_return_id_fkey FOREIGN KEY (return_id) REFERENCES public.salesreturns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salesinvoices salesinvoices_branchid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesinvoices
    ADD CONSTRAINT salesinvoices_branchid_fkey FOREIGN KEY (branchid) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: salesinvoices salesinvoices_createdby_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesinvoices
    ADD CONSTRAINT salesinvoices_createdby_fkey FOREIGN KEY (createdby) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: salesinvoices salesinvoices_customerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesinvoices
    ADD CONSTRAINT salesinvoices_customerid_fkey FOREIGN KEY (customerid) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: salesreturns salesreturns_branchid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesreturns
    ADD CONSTRAINT salesreturns_branchid_fkey FOREIGN KEY (branchid) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: salesreturns salesreturns_createdby_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesreturns
    ADD CONSTRAINT salesreturns_createdby_fkey FOREIGN KEY (createdby) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: salesreturns salesreturns_salesinvoiceid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesreturns
    ADD CONSTRAINT salesreturns_salesinvoiceid_fkey FOREIGN KEY (salesinvoiceid) REFERENCES public.salesinvoices(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_locations stock_locations_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_locations
    ADD CONSTRAINT stock_locations_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_stock_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_stock_location_id_fkey FOREIGN KEY (stock_location_id) REFERENCES public.stock_locations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: subcategories subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict fs2YRG3eBsumDMyV76NnbFfZn5jZscDG8MqSfQJgMTN6wLgQOfFrDmH73PSe7rL

