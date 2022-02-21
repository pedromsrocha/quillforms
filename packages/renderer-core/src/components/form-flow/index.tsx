/* eslint-disable no-nested-ternary */
/**
 * Quill Forms Dependencies
 */
import configApi from '@quillforms/config';

/**
 * WordPress Dependencies
 */
import { Fragment, useEffect, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * External Dependencies
 */
import { css } from 'emotion';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */
import WelcomeScreensWrapper from '../welcome-screens-wrapper';
import ThankyouScreensWrapper from '../thankyou-screens-wrapper';
import FieldsWrapper from '../fields-wrapper';
import FormFooter from '../form-footer';
import useGeneralTheme from '../../hooks/use-general-theme';
import useBlocks from '../../hooks/use-blocks';
import PaymentModal from '../payment-modal';
import { useCurrentTheme } from '../..';

interface Props {
	applyLogic: boolean;
}
const FormFlow: React.FC< Props > = ( { applyLogic } ) => {
	const blocks = useBlocks();
	const generalTheme = useGeneralTheme();
	const currentTheme = useCurrentTheme();
	const fonts = configApi.getFonts();

	const { font } = currentTheme;

	// @ts-expect-error
	const fontType = fonts[ font ];
	let fontUrl;
	switch ( fontType ) {
		case 'googlefonts':
			fontUrl =
				'https://fonts.googleapis.com/css?family=' +
				font +
				':100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic';

			break;

		case 'earlyaccess':
			//@ts-expect-error
			const fontLowerString = font.replace( /\s+/g, '' ).toLowerCase();
			fontUrl =
				'https://fonts.googleapis.com/earlyaccess/' +
				fontLowerString +
				'.css';
			break;
	}
	useEffect( () => {
		const head = document.head;
		const link = document.createElement( 'link' );

		link.type = 'text/css';
		link.rel = 'stylesheet';
		if ( font ) {
			link.href = fontUrl;
			const existingLinkEl = document.querySelector(
				`link[href='${ link.href }']`
			);
			if ( ! existingLinkEl ) head.appendChild( link );
		}
	}, [ font ] );

	const { setIsFocused } = useDispatch( 'quillForms/renderer-core' );
	const ref = useRef< any >( null );
	const {
		isWelcomeScreenActive,
		isThankyouScreenActive,
		paymentData,
	} = useSelect( ( select ) => {
		const store = select( 'quillForms/renderer-core' );
		return {
			isThankyouScreenActive: store.isThankyouScreenActive(),
			isWelcomeScreenActive: store.isWelcomeScreenActive(),
			paymentData: store.getPaymentData(),
		};
	} );

	useEffect( () => {
		/**
		 * Alert if clicked on outside of element
		 */
		function handleClickOutside( event ) {
			if ( ref.current && ! ref.current.contains( event.target ) ) {
				setIsFocused( false );
			}
		}

		// Bind the event listener
		document.addEventListener( 'mousedown', handleClickOutside );
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener( 'mousedown', handleClickOutside );
		};
	}, [ ref ] );

	const keydownHandler = ( e ) => {
		// Prevent any keyboard event by default in case of any tab event in general.
		if ( e.key === 'Tab' ) {
			e.preventDefault();
			return;
		}
	};

	useEffect( () => {
		window.addEventListener( 'keydown', keydownHandler );

		return () => {
			window.removeEventListener( 'keydown', keydownHandler );
		};
	}, [] );

	let backgroundImageCSS = '';
	if ( generalTheme.backgroundImage && generalTheme.backgroundImage ) {
		backgroundImageCSS = `background: url('${ generalTheme.backgroundImage }') no-repeat;
			background-size: cover;
			background-position: center;
		`;
	}

	return (
		<div
			ref={ ref }
			className={ classnames(
				css`
					height: 100%;
					width: 100%;
					${ backgroundImageCSS }
				`,
				'renderer-core-form-flow__wrapper'
			) }
			tabIndex={ 0 }
			onMouseDown={ () => setIsFocused( true ) }
		>
			<div
				className={ classnames(
					'renderer-core-form-flow',
					css`
						position: relative;
						width: 100%;
						height: 100%;
						overflow: hidden;
						background: ${ generalTheme.backgroundColor };
						font-family: ${ generalTheme.font };
					`
				) }
				onClick={ () => {
					setIsFocused( true );
				} }
			>
				{ blocks.length > 0 && (
					<Fragment>
						{ isWelcomeScreenActive && <WelcomeScreensWrapper /> }
						<FieldsWrapper
							isActive={
								! isWelcomeScreenActive &&
								! isThankyouScreenActive
							}
							applyLogic={ applyLogic }
						/>

						{ isThankyouScreenActive && <ThankyouScreensWrapper /> }
					</Fragment>
				) }
				<FormFooter />
			</div>
			{ !! paymentData && <PaymentModal data={ paymentData } /> }
		</div>
	);
};
export default FormFlow;
